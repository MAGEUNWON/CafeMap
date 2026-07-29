/**
 * 카페 기록 도메인 타입.
 * 분위기 값과 라벨은 이 파일 한 곳에서만 정의한다.
 */

export type Atmosphere =
  | "quiet"
  | "moody"
  | "talk"
  | "work"
  | "photo"
  | "coffee"
  | "dessert"
  | "spacious"
  | "waiting"
  | "revisit";

export const atmosphereLabel: Record<Atmosphere, string> = {
  quiet: "조용함",
  moody: "감성적",
  talk: "대화하기 좋음",
  work: "작업하기 좋음",
  photo: "사진 찍기 좋음",
  coffee: "커피가 맛있음",
  dessert: "디저트가 맛있음",
  spacious: "공간이 넓음",
  waiting: "웨이팅 있음",
  revisit: "재방문하고 싶음",
};

/** 등록 폼에서 고를 수 있는 분위기 (전체) */
export const ATMOSPHERE_OPTIONS: Atmosphere[] = [
  "quiet",
  "moody",
  "talk",
  "work",
  "photo",
  "coffee",
  "dessert",
  "spacious",
  "waiting",
  "revisit",
];

/** 목록 필터에 노출하는 분위기 — 기획에서 지정한 8개 */
export const ATMOSPHERE_FILTERS: Atmosphere[] = [
  "quiet",
  "moody",
  "talk",
  "work",
  "photo",
  "coffee",
  "dessert",
  "revisit",
];

export interface CafeRecord {
  id: number;
  name: string;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  /** 로컬 SVG 경로 또는 업로드된 이미지의 data URL. 사진 없으면 빈 문자열 */
  photoUrl: string;
  atmosphere: Atmosphere[];
  memo: string;
  /** YYYY-MM-DD */
  visitedAt: string;
  /** ISO 8601 */
  createdAt: string;
}

/** 등록·수정 폼이 만들어내는 값 */
export type CafeInput = Omit<CafeRecord, "id" | "createdAt">;

export type CafeSort = "visitedDesc" | "createdDesc" | "visitedAsc";

export const cafeSortLabel: Record<CafeSort, string> = {
  visitedDesc: "최근 방문순",
  createdDesc: "최근 등록순",
  visitedAsc: "오래된 방문순",
};

/** 장소 검색 결과 (지금은 목업, 나중에 장소 검색 API 응답으로 교체) */
export interface PlaceSuggestion {
  id: string;
  name: string;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
}
