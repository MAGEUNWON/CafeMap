import {
  BackupParseError,
  makeBackup,
  nextIdOf,
  parseBackup,
} from "~/core/backup/schema";
import type { CafeBackup } from "~/types/backup";
import type { CafeInput, CafeRecord } from "~/types/cafe";
import { CafeStorageError, type CafeRepository } from "./cafeRepository";

const STORAGE_KEY = "cafemap.records.v1";
/** 읽다 실패한 원본을 옮겨 두는 곳 — 사람이 나중에 살려낼 수 있게 */
const QUARANTINE_PREFIX = "cafemap.records.corrupt.";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

/** 비어 있는 저장소 — 최초 실행 */
function empty(): CafeBackup {
  return makeBackup([], 1, new Date().toISOString());
}

/**
 * 읽기.
 *
 * 예전에는 값이 깨지면 목업 8개를 덮어써 버렸다. 화면은 살아났지만
 * 사용자의 진짜 기록이 사라졌다. 이제는 **아무것도 쓰지 않고 던진다** —
 * 원본이 남아 있어야 백업 가져오기로든 손으로든 되살릴 수 있다.
 */
function read(): CafeBackup {
  if (!isBrowser()) return empty();

  const raw = localStorage.getItem(STORAGE_KEY);
  // 최초 실행. 시드를 심지 않는다 — 내 기록만 있어야 한다
  if (raw === null) return empty();

  try {
    return parseBackup(raw).backup;
  } catch (err) {
    quarantine(raw);
    throw new CafeStorageError(
      err instanceof BackupParseError
        ? `저장된 기록을 읽지 못함 — ${err.message}`
        : "저장된 기록을 읽지 못함",
      "corrupt",
    );
  }
}

/** 원본을 다른 키로 옮겨 둔다. 이것마저 실패해도 원본은 제자리에 남는다 */
function quarantine(raw: string): void {
  try {
    localStorage.setItem(`${QUARANTINE_PREFIX}${Date.now()}`, raw);
  } catch {
    // 용량이 없어 못 옮겨도 원래 키는 건드리지 않았으니 그대로 둔다
  }
}

function isQuotaExceeded(err: unknown): boolean {
  if (!(err instanceof DOMException)) return false;
  return (
    err.name === "QuotaExceededError" ||
    err.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    err.code === 22 ||
    err.code === 1014
  );
}

/**
 * 쓰기.
 *
 * 실패해도 기존 값은 그대로 남는다(setItem 은 성공해야 바뀐다).
 * 스토어도 이 함수가 성공한 뒤에만 메모리를 갱신하므로 반쪽 상태가 안 생긴다.
 */
function write(backup: CafeBackup): void {
  if (!isBrowser()) return;

  // 직렬화는 try 밖에서 — 여기서 나는 오류를 "용량 부족"으로 오해하면 안 된다
  const json = JSON.stringify(backup);

  try {
    localStorage.setItem(STORAGE_KEY, json);
  } catch (err) {
    if (isQuotaExceeded(err)) {
      throw new CafeStorageError(
        "저장 공간이 가득 참. 사진을 줄이거나 기록을 정리해야 함",
        "quota",
      );
    }
    // 사파리 시크릿 모드 등 — 용량 문제가 아니라 쓰기 자체가 막힌 경우
    throw new CafeStorageError(
      "브라우저가 저장을 막고 있음. 시크릿 모드인지 확인해야 함",
      "blocked",
    );
  }
}

function save(records: CafeRecord[], nextId: number): void {
  write(makeBackup(records, nextId, new Date().toISOString()));
}

export function createLocalStorageCafeRepository(): CafeRepository {
  return {
    async list() {
      return read().records;
    },

    async get(id) {
      return read().records.find((record) => record.id === id) ?? null;
    },

    async create(input: CafeInput) {
      const { records, nextId } = read();
      const record: CafeRecord = {
        ...input,
        id: nextId,
        createdAt: new Date().toISOString(),
      };
      save([record, ...records], nextId + 1);
      return record;
    },

    async update(id, input: CafeInput) {
      const { records, nextId } = read();
      const index = records.findIndex((record) => record.id === id);
      const current = records[index];
      if (index === -1 || !current) {
        throw new CafeStorageError("수정할 기록을 찾을 수 없음", "notfound");
      }

      const updated: CafeRecord = {
        ...input,
        id: current.id,
        createdAt: current.createdAt,
      };
      const next = [...records];
      next[index] = updated;
      save(next, nextId);
      return updated;
    },

    async remove(id) {
      const { records, nextId } = read();
      // nextId 는 줄이지 않는다 — 지운 번호를 다음 기록이 물려받으면 안 된다
      save(
        records.filter((record) => record.id !== id),
        nextId,
      );
    },

    async exportAll() {
      return read();
    },

    async replaceAll(records: CafeRecord[]) {
      // 지우고 쓰지 않는다. setItem 한 번이라 실패하면 기존 값이 그대로 남는다
      save(records, nextIdOf(records));
      return records;
    },
  };
}
