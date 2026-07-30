import type { CafeRecord } from "./cafe";

/**
 * 저장소에 넣는 값과 내보내기 파일이 **같은 타입**이다.
 *
 * 배열만 덜렁 저장하면 나중에 형태가 바뀌었을 때 "예전 것"인지 "깨진 것"인지
 * 구분할 방법이 없다. schema 를 달아 두면 읽는 쪽이 판단할 수 있고,
 * 백엔드가 생기면 이 파일을 그대로 올려 옮길 수 있다.
 */
export interface CafeBackup {
  app: "cafemap";
  schema: number;
  /** ISO 8601 */
  savedAt: string;
  /** 다음에 발급할 id. 최고 id 를 지워도 번호가 재사용되지 않게 한다 */
  nextId: number;
  records: CafeRecord[];
}

export const BACKUP_APP = "cafemap";

/**
 * 1: CafeRecord[] 배열만 저장하던 시절
 * 2: 봉투(app/schema/savedAt/nextId/records)
 */
export const CURRENT_SCHEMA = 2;
