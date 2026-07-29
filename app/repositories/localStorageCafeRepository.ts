import { mockCafes } from "~/data/mockCafes";
import type { CafeInput, CafeRecord } from "~/types/cafe";
import { CafeStorageError, type CafeRepository } from "./cafeRepository";

const STORAGE_KEY = "cafemap.records.v1";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function read(): CafeRecord[] {
  if (!isBrowser()) return [];

  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    // 최초 실행 — 목업 데이터를 씨앗으로 심는다
    write(mockCafes);
    return [...mockCafes];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("형식이 배열이 아님");
    return parsed as CafeRecord[];
  } catch {
    // 저장값이 깨졌으면 시드로 되돌린다 — 화면이 멈추는 것보다 낫다
    write(mockCafes);
    return [...mockCafes];
  }
}

function write(records: CafeRecord[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    throw new CafeStorageError(
      "저장 공간이 가득 참. 사진 크기를 줄이거나 기록을 정리해야 함",
    );
  }
}

function nextId(records: CafeRecord[]): number {
  return records.reduce((max, record) => Math.max(max, record.id), 0) + 1;
}

export function createLocalStorageCafeRepository(): CafeRepository {
  return {
    async list() {
      return read();
    },

    async get(id) {
      return read().find((record) => record.id === id) ?? null;
    },

    async create(input: CafeInput) {
      const records = read();
      const record: CafeRecord = {
        ...input,
        id: nextId(records),
        createdAt: new Date().toISOString(),
      };
      write([record, ...records]);
      return record;
    },

    async update(id, input: CafeInput) {
      const records = read();
      const index = records.findIndex((record) => record.id === id);
      const current = records[index];
      if (index === -1 || !current) {
        throw new CafeStorageError("수정할 기록을 찾을 수 없음");
      }

      const updated: CafeRecord = {
        ...input,
        id: current.id,
        createdAt: current.createdAt,
      };
      const next = [...records];
      next[index] = updated;
      write(next);
      return updated;
    },

    async remove(id) {
      const records = read();
      write(records.filter((record) => record.id !== id));
    },
  };
}
