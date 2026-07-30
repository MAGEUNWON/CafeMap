import {
  ATMOSPHERE_OPTIONS,
  type Atmosphere,
  type CafeRecord,
} from "~/types/cafe";
import { BACKUP_APP, CURRENT_SCHEMA, type CafeBackup } from "~/types/backup";

/**
 * 저장된 값과 가져온 파일을 검증하는 곳.
 *
 * 저장소(localStorageCafeRepository)와 백업 가져오기가 **같은 함수**를 쓴다.
 * 두 벌로 나뉘면 한쪽만 고쳐져 서로 다른 걸 통과시키게 된다.
 */

/** 왜 실패했는지 — 부르는 쪽이 문구와 대응을 고를 수 있게 */
export type BackupProblem =
  "notJson" | "notObject" | "foreignApp" | "tooNew" | "noRecords";

export class BackupParseError extends Error {
  constructor(
    readonly problem: BackupProblem,
    message: string,
  ) {
    super(message);
    this.name = "BackupParseError";
  }
}

const ATMOSPHERE_SET = new Set<string>(ATMOSPHERE_OPTIONS);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * 레코드 한 건이 쓸 만한지.
 *
 * 화면이 기대는 필드만 본다. 좌표가 없으면 지도에 못 찍고 날짜가 없으면
 * 정렬이 깨지므로 이 둘은 특히 엄격하게 본다.
 */
export function isCafeRecord(value: unknown): value is CafeRecord {
  if (!isObject(value)) return false;

  const {
    id,
    name,
    address,
    district,
    latitude,
    longitude,
    photoUrl,
    atmosphere,
    memo,
    visitedAt,
    createdAt,
  } = value;

  if (typeof id !== "number" || !Number.isFinite(id)) return false;
  if (typeof name !== "string" || name.trim() === "") return false;
  if (typeof address !== "string") return false;
  if (typeof district !== "string") return false;
  if (typeof latitude !== "number" || !Number.isFinite(latitude)) return false;
  if (typeof longitude !== "number" || !Number.isFinite(longitude)) {
    return false;
  }
  if (typeof photoUrl !== "string") return false;
  if (typeof memo !== "string") return false;
  if (typeof visitedAt !== "string" || !DATE_PATTERN.test(visitedAt)) {
    return false;
  }
  if (typeof createdAt !== "string" || createdAt === "") return false;
  if (!Array.isArray(atmosphere)) return false;
  if (!atmosphere.every((tag) => typeof tag === "string")) return false;

  return true;
}

/** 모르는 분위기 값은 통째로 버리지 않고 그것만 걸러낸다 */
function cleanAtmosphere(record: CafeRecord): CafeRecord {
  const kept = record.atmosphere.filter((tag) =>
    ATMOSPHERE_SET.has(tag),
  ) as Atmosphere[];
  return kept.length === record.atmosphere.length
    ? record
    : { ...record, atmosphere: kept };
}

export interface ParsedBackup {
  backup: CafeBackup;
  /** 형식이 맞지 않아 버린 레코드 수 — 사용자에게 정직하게 알린다 */
  dropped: number;
}

export function nextIdOf(records: readonly CafeRecord[]): number {
  return records.reduce((max, record) => Math.max(max, record.id), 0) + 1;
}

export function makeBackup(
  records: CafeRecord[],
  nextId: number,
  savedAt: string,
): CafeBackup {
  return {
    app: BACKUP_APP,
    schema: CURRENT_SCHEMA,
    savedAt,
    nextId,
    records,
  };
}

/**
 * 저장값·백업파일을 파싱한다. 스키마 1(배열)도 받아준다.
 *
 * 판단이 안 서면 **던진다**. 조용히 빈 값으로 처리하면 부르는 쪽이
 * 그걸 "기록 없음"으로 오해하고 덮어쓸 수 있다.
 */
export function parseBackup(raw: string): ParsedBackup {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new BackupParseError("notJson", "파일을 읽을 수 없음");
  }

  // 스키마 1 — 배열만 저장하던 시절
  if (Array.isArray(parsed)) {
    return collect(parsed, undefined);
  }

  if (!isObject(parsed)) {
    throw new BackupParseError("notObject", "Cafe Pin 백업 형식이 아님");
  }

  if (parsed.app !== BACKUP_APP) {
    throw new BackupParseError("foreignApp", "Cafe Pin에서 만든 파일이 아님");
  }

  if (typeof parsed.schema === "number" && parsed.schema > CURRENT_SCHEMA) {
    // 모르는 형식을 억지로 읽어 반쪽만 살리면 오히려 데이터가 상한다
    throw new BackupParseError(
      "tooNew",
      "더 최신 버전에서 만든 백업이라 읽을 수 없음",
    );
  }

  if (!Array.isArray(parsed.records)) {
    throw new BackupParseError("noRecords", "기록 목록이 없음");
  }

  const declared =
    typeof parsed.nextId === "number" && Number.isFinite(parsed.nextId)
      ? parsed.nextId
      : undefined;

  return collect(parsed.records, declared);
}

function collect(items: unknown[], declaredNextId?: number): ParsedBackup {
  const records: CafeRecord[] = [];
  let dropped = 0;

  for (const item of items) {
    if (isCafeRecord(item)) records.push(cleanAtmosphere(item));
    else dropped += 1;
  }

  // 적힌 nextId 가 실제 최대 id 보다 작으면 번호가 겹친다. 큰 쪽을 쓴다.
  const computed = nextIdOf(records);
  const nextId =
    declaredNextId !== undefined
      ? Math.max(declaredNextId, computed)
      : computed;

  return {
    backup: makeBackup(records, nextId, new Date().toISOString()),
    dropped,
  };
}
