import type { CafeRecord } from "~/types/cafe";
import { nextIdOf } from "./schema";

/**
 * 백업 병합.
 *
 * 같은 카페인지는 id 가 아니라 자연키로 판단한다 — 파일의 id 는
 * 다른 시점의 카운터에서 나온 값이라 기존 기록과 얼마든지 겹친다.
 */

/** 이름 + 방문일 + 좌표. 좌표는 정확 일치 — 주 시나리오가 "내가 내보낸 파일 재가져오기"라 값이 같다 */
export function naturalKey(record: CafeRecord): string {
  return `${record.name.trim()}|${record.visitedAt}|${record.latitude}|${record.longitude}`;
}

export interface MergeResult {
  records: CafeRecord[];
  nextId: number;
  /** 새로 들어온 건수 */
  added: number;
  /** 이미 있어서 건너뛴 건수 (파일 안 중복 포함) */
  skipped: number;
}

/**
 * 기존 기록은 그대로 두고, 파일에서 새 카페만 골라 뒤에 붙인다.
 * 새 레코드는 id 를 재발급한다 — 나머지 필드(createdAt 포함)는 파일 값 그대로.
 */
export function mergeRecords(
  existing: CafeRecord[],
  incoming: CafeRecord[],
  nextId: number,
): MergeResult {
  const seen = new Set(existing.map(naturalKey));
  // 저장된 카운터가 뒤로 감겨 있어도 id 가 겹치지 않게 큰 쪽에서 시작한다
  let id = Math.max(nextId, nextIdOf(existing));

  const records = [...existing];
  let added = 0;
  let skipped = 0;

  for (const record of incoming) {
    const key = naturalKey(record);
    if (seen.has(key)) {
      skipped += 1;
      continue;
    }
    seen.add(key);
    records.push({ ...record, id: id++ });
    added += 1;
  }

  return { records, nextId: id, added, skipped };
}
