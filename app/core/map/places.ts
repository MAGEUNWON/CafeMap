import type { PlaceSuggestion } from "~/types/cafe";
import { loadKakaoMaps } from "./kakaoSdk";

/**
 * 카카오 장소 검색.
 *
 * 카페 이름 칸은 카페 카테고리로 좁혀 검색 품질을 올리고,
 * 위치 칸은 제한 없이 찾는다.
 */
export type PlaceCategory = "cafe" | "any";

/** 카카오 카테고리 그룹 코드 — CE7 은 카페 */
const CAFE_CATEGORY_CODE = "CE7";

const MAX_RESULTS = 6;

export async function searchPlaces(
  appKey: string,
  keyword: string,
  category: PlaceCategory,
): Promise<PlaceSuggestion[]> {
  const query = keyword.trim();
  if (!query) return [];

  await loadKakaoMaps(appKey);

  return new Promise<PlaceSuggestion[]>((resolve, reject) => {
    const places = new kakao.maps.services.Places();

    places.keywordSearch(
      query,
      (data, status) => {
        if (status === kakao.maps.services.Status.ZERO_RESULT) {
          resolve([]);
          return;
        }
        if (status !== kakao.maps.services.Status.OK) {
          reject(new Error("장소를 검색하지 못함"));
          return;
        }
        resolve(data.slice(0, MAX_RESULTS).map(toSuggestion));
      },
      category === "cafe" ? { category_group_code: CAFE_CATEGORY_CODE } : {},
    );
  });
}

type SearchResultItem = kakao.maps.services.PlacesSearchResultItem;

function toSuggestion(item: SearchResultItem): PlaceSuggestion {
  return {
    id: item.id,
    name: item.place_name,
    // 도로명이 있으면 그걸 우선 — 사람이 기억하기 쉽다
    address: item.road_address_name || item.address_name,
    district: districtOf(item.address_name),
    latitude: Number(item.y),
    longitude: Number(item.x),
  };
}

/** "서울 성동구 성수동2가 123-4" → "성수동2가" */
function districtOf(addressName: string): string {
  const tokens = addressName.split(" ").filter(Boolean);
  const dong = tokens.find(
    (token) => /(동|가|읍|면|리)\d*$/.test(token) && !token.endsWith("구"),
  );
  return dong ?? tokens[2] ?? tokens[tokens.length - 1] ?? addressName;
}
