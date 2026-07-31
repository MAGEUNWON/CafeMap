import { makeBackup, nextIdOf } from "~/core/backup/schema";
import { getSupabase } from "~/core/supabase";
import type { Atmosphere, CafeInput, CafeRecord } from "~/types/cafe";
import { CafeStorageError, type CafeRepository } from "./cafeRepository";

/**
 * Supabase 구현.
 *
 * - 기록은 cafes 테이블(RLS 로 자기 행만), 사진은 cafe-photos 버킷.
 * - 화면이 아는 CafeRecord 모양은 그대로 두고 여기서 snake_case 와 오간다.
 * - photoUrl 이 data URL 로 들어오면(업로드 폼·백업 가져오기) Storage 에
 *   올리고 공개 URL 로 바꾼다 — 이게 localStorage 백업의 이관 경로다.
 */

const BUCKET = "cafe-photos";
const PUBLIC_MARKER = `/storage/v1/object/public/${BUCKET}/`;

interface CafeRow {
  id: number;
  name: string;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  photo_url: string;
  photo_path: string;
  atmosphere: string[];
  memo: string;
  /** date 컬럼 — PostgREST 가 YYYY-MM-DD 문자열로 준다 */
  visited_at: string;
  /** timestamptz — ISO 문자열 */
  created_at: string;
}

function toRecord(row: CafeRow): CafeRecord {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    district: row.district,
    latitude: row.latitude,
    longitude: row.longitude,
    photoUrl: row.photo_url,
    atmosphere: row.atmosphere as Atmosphere[],
    memo: row.memo,
    visitedAt: row.visited_at,
    createdAt: row.created_at,
  };
}

function storageError(message: string): CafeStorageError {
  return new CafeStorageError(message, "blocked");
}

/** 우리 버킷의 공개 URL 이면 오브젝트 경로를 되찾는다 (병합·가져오기 때 필요) */
function pathFromPublicUrl(url: string): string {
  const index = url.indexOf(PUBLIC_MARKER);
  return index === -1 ? "" : url.slice(index + PUBLIC_MARKER.length);
}

export function createSupabaseCafeRepository(): CafeRepository {
  const supabase = getSupabase();

  async function userId(): Promise<string> {
    const { data } = await supabase.auth.getSession();
    const id = data.session?.user.id;
    if (!id) throw storageError("로그인이 필요함");
    return id;
  }

  /**
   * photoUrl 을 저장 가능한 형태로.
   * data URL → 업로드 후 공개 URL, 그 외 → 그대로(경로는 URL 에서 역산).
   */
  async function resolvePhoto(
    owner: string,
    photoUrl: string,
  ): Promise<{ url: string; path: string }> {
    if (!photoUrl.startsWith("data:")) {
      return { url: photoUrl, path: pathFromPublicUrl(photoUrl) };
    }

    const blob = await (await fetch(photoUrl)).blob();
    const path = `${owner}/${crypto.randomUUID()}.jpg`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
      contentType: blob.type || "image/jpeg",
    });
    if (error) throw storageError("사진을 올리지 못함");

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { url: data.publicUrl, path };
  }

  /** 실패해도 기록 동작을 막지 않는다 — 고아 파일은 남는 것보다 덜 나쁘다 */
  async function removePhotos(paths: string[]): Promise<void> {
    const targets = paths.filter((path) => path !== "");
    if (targets.length === 0) return;
    await supabase.storage
      .from(BUCKET)
      .remove(targets)
      .catch(() => undefined);
  }

  function toRow(input: CafeInput, photo: { url: string; path: string }) {
    return {
      name: input.name,
      address: input.address,
      district: input.district,
      latitude: input.latitude,
      longitude: input.longitude,
      photo_url: photo.url,
      photo_path: photo.path,
      atmosphere: input.atmosphere,
      memo: input.memo,
      visited_at: input.visitedAt,
    };
  }

  return {
    async list() {
      const { data, error } = await supabase
        .from("cafes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw storageError("기록을 불러오지 못함");
      return (data as CafeRow[]).map(toRecord);
    },

    async get(id) {
      const { data, error } = await supabase
        .from("cafes")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw storageError("기록을 불러오지 못함");
      return data ? toRecord(data as CafeRow) : null;
    },

    async create(input: CafeInput) {
      const owner = await userId();
      const photo = await resolvePhoto(owner, input.photoUrl);
      const { data, error } = await supabase
        .from("cafes")
        .insert(toRow(input, photo))
        .select()
        .single();
      if (error) throw storageError("기록을 저장하지 못함");
      return toRecord(data as CafeRow);
    },

    async update(id, input: CafeInput) {
      const owner = await userId();

      const { data: current, error: findError } = await supabase
        .from("cafes")
        .select("photo_path")
        .eq("id", id)
        .maybeSingle();
      if (findError) throw storageError("기록을 불러오지 못함");
      if (!current) {
        throw new CafeStorageError("수정할 기록을 찾을 수 없음", "notfound");
      }

      const photo = await resolvePhoto(owner, input.photoUrl);
      const { data, error } = await supabase
        .from("cafes")
        .update(toRow(input, photo))
        .eq("id", id)
        .select()
        .single();
      if (error) throw storageError("기록을 저장하지 못함");

      // 사진이 바뀌었으면 이전 파일 정리
      const oldPath = (current as { photo_path: string }).photo_path;
      if (oldPath && oldPath !== photo.path) await removePhotos([oldPath]);

      return toRecord(data as CafeRow);
    },

    async remove(id) {
      const { data, error: findError } = await supabase
        .from("cafes")
        .select("photo_path")
        .eq("id", id)
        .maybeSingle();
      if (findError) throw storageError("기록을 불러오지 못함");

      const { error } = await supabase.from("cafes").delete().eq("id", id);
      if (error) throw storageError("기록을 지우지 못함");

      const path = (data as { photo_path: string } | null)?.photo_path;
      if (path) await removePhotos([path]);
    },

    async exportAll() {
      const records = await this.list();
      return makeBackup(records, nextIdOf(records), new Date().toISOString());
    },

    /**
     * 전체 교체 — id 는 서버가 다시 발급한다(nextId 인자는 서버 모드에서 무의미).
     * 가져오기 흐름이 교체 전에 자동 내보내기를 해두므로, 중간 실패 시
     * 그 파일로 되돌릴 수 있다.
     */
    async replaceAll(records: CafeRecord[]) {
      const owner = await userId();

      const { data: oldRows, error: listError } = await supabase
        .from("cafes")
        .select("photo_path");
      if (listError) throw storageError("기록을 불러오지 못함");
      const oldPaths = (oldRows as { photo_path: string }[]).map(
        (row) => row.photo_path,
      );

      const { error: deleteError } = await supabase
        .from("cafes")
        .delete()
        .neq("id", 0);
      if (deleteError) throw storageError("기존 기록을 지우지 못함");

      const saved: CafeRecord[] = [];
      const usedPaths = new Set<string>();
      for (const record of records) {
        const photo = await resolvePhoto(owner, record.photoUrl);
        usedPaths.add(photo.path);
        const { data, error } = await supabase
          .from("cafes")
          .insert({ ...toRow(record, photo), created_at: record.createdAt })
          .select()
          .single();
        if (error) {
          throw storageError(
            `${saved.length}/${records.length}곳 저장 후 실패함. 내보내 둔 백업 파일로 다시 가져오면 됨`,
          );
        }
        saved.push(toRecord(data as CafeRow));
      }

      // 새 기록이 참조하지 않는 옛 사진만 정리
      await removePhotos(oldPaths.filter((path) => !usedPaths.has(path)));

      return saved;
    },

    async usedBytes() {
      // 서버 저장이라 브라우저 한도가 없다 — 화면은 null 이면 게이지를 감춘다
      return null;
    },
  };
}
