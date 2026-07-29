import type { PlaceSuggestion } from "~/types/cafe";

/**
 * 장소 검색 목업.
 * 나중에 카카오/네이버 장소 검색 API 응답을 PlaceSuggestion 으로 변환해 이 자리를 대체한다.
 */
const places: PlaceSuggestion[] = [
  {
    id: "p1",
    name: "성수동 카페거리",
    address: "서울 성동구 성수동2가 연무장길",
    district: "성수동2가",
    latitude: 37.5449,
    longitude: 127.0559,
  },
  {
    id: "p2",
    name: "서울숲",
    address: "서울 성동구 성수동1가 뚝섬로 273",
    district: "서울숲",
    latitude: 37.5443,
    longitude: 127.0374,
  },
  {
    id: "p3",
    name: "성수역 3번 출구",
    address: "서울 성동구 성수동2가 아차산로 100",
    district: "성수동2가",
    latitude: 37.5447,
    longitude: 127.0557,
  },
  {
    id: "p4",
    name: "뚝섬역 8번 출구",
    address: "서울 성동구 성수동1가 아차산로 25",
    district: "뚝섬",
    latitude: 37.5473,
    longitude: 127.0473,
  },
  {
    id: "p5",
    name: "연무장길 초입",
    address: "서울 성동구 성수동2가 연무장길 11",
    district: "성수동2가",
    latitude: 37.5432,
    longitude: 127.0548,
  },
  {
    id: "p6",
    name: "서울숲길",
    address: "서울 성동구 성수동1가 서울숲2길",
    district: "서울숲",
    latitude: 37.5455,
    longitude: 127.0412,
  },
  {
    id: "p7",
    name: "성수동1가 아차산로",
    address: "서울 성동구 성수동1가 아차산로 60",
    district: "성수동1가",
    latitude: 37.5438,
    longitude: 127.0505,
  },
  {
    id: "p8",
    name: "뚝섬유원지 방면",
    address: "서울 성동구 성수동2가 광나루로 120",
    district: "뚝섬",
    latitude: 37.5386,
    longitude: 127.0612,
  },
  {
    id: "p9",
    name: "성수동2가 성수이로",
    address: "서울 성동구 성수동2가 성수이로 84",
    district: "성수동2가",
    latitude: 37.5401,
    longitude: 127.0583,
  },
  {
    id: "p10",
    name: "왕십리로 서울숲 방면",
    address: "서울 성동구 성수동1가 왕십리로 83",
    district: "서울숲",
    latitude: 37.549,
    longitude: 127.0395,
  },
];

/** 이름·주소·동네 부분 일치 검색 */
export function searchPlaces(keyword: string): PlaceSuggestion[] {
  const q = keyword.trim().toLowerCase();
  if (!q) return [];
  return places
    .filter(
      (place) =>
        place.name.toLowerCase().includes(q) ||
        place.address.toLowerCase().includes(q) ||
        place.district.toLowerCase().includes(q),
    )
    .slice(0, 6);
}
