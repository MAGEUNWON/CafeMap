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
}

/** 저장 용량 초과처럼 사용자에게 알려야 하는 실패 */
export class CafeStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CafeStorageError";
  }
}
