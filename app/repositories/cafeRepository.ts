import type { CafeBackup } from "~/types/backup";
import type { CafeInput, CafeRecord } from "~/types/cafe";

/**
 * 카페 기록 저장소 계약.
 *
 * 지금은 localStorage 구현 하나뿐이지만, 백엔드가 붙으면
 * 같은 인터페이스를 구현한 apiCafeRepository 를 만들어
 * stores/cafe.ts 의 주입 한 줄만 바꾸면 된다.
 * 화면 컴포넌트는 이 계층을 직접 호출하지 않는다.
 */
export interface CafeRepository {
  list(): Promise<CafeRecord[]>;
  get(id: number): Promise<CafeRecord | null>;
  create(input: CafeInput): Promise<CafeRecord>;
  update(id: number, input: CafeInput): Promise<CafeRecord>;
  remove(id: number): Promise<void>;
  /** 백업 내보내기 */
  exportAll(): Promise<CafeBackup>;
  /**
   * 백업 가져오기 — 통째로 갈아끼운다.
   * nextId 를 주면 그 값을 저장한다(최소 nextIdOf(records) 보장) —
   * 병합처럼 카운터가 목록의 최대 id 보다 앞서 있어야 하는 경우용.
   */
  replaceAll(records: CafeRecord[], nextId?: number): Promise<CafeRecord[]>;
  /**
   * 저장에 쓰고 있는 바이트 수. 한도가 있는 저장소에서만 뜻이 있다.
   * 백엔드 구현은 null 을 돌려주면 화면이 알아서 감춘다.
   */
  usedBytes(): Promise<number | null>;
}

/**
 * 사용자에게 알려야 하는 저장소 실패.
 *
 * code 로 나눠 두는 이유: "용량이 가득 참"과 "브라우저가 막음"과 "값이 깨짐"은
 * 사용자가 해야 할 일이 완전히 다르다. 예전에는 전부 "용량 부족"으로 뭉쳐 있었다.
 */
export type CafeStorageErrorCode = "quota" | "blocked" | "corrupt" | "notfound";

export class CafeStorageError extends Error {
  constructor(
    message: string,
    readonly code: CafeStorageErrorCode,
  ) {
    super(message);
    this.name = "CafeStorageError";
  }
}
