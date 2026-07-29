/**
 * 목업 지도의 좌표 변환.
 *
 * 실제 지도 SDK(카카오/네이버)로 교체할 때는 이 파일과 CafeMap.vue 만 갈아끼우면 된다.
 * 컴포넌트는 항상 위경도만 넘기고 픽셀 좌표를 직접 다루지 않는다.
 */

/** 성수·서울숲 일대 */
export const MAP_BOUNDS = {
  minLat: 37.5355,
  maxLat: 37.5515,
  minLng: 127.0355,
  maxLng: 127.0655,
} as const;

export interface MapPoint {
  /** 지도 영역 기준 가로 위치 0~100 (%) */
  x: number;
  /** 지도 영역 기준 세로 위치 0~100 (%) */
  y: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** 위경도 → 지도 영역 내 백분율 좌표. 위도는 위로 갈수록 커지므로 y 를 뒤집는다. */
export function projectToMap(latitude: number, longitude: number): MapPoint {
  const { minLat, maxLat, minLng, maxLng } = MAP_BOUNDS;
  const x = ((longitude - minLng) / (maxLng - minLng)) * 100;
  const y = (1 - (latitude - minLat) / (maxLat - minLat)) * 100;
  // 마커가 지도 밖으로 잘려나가지 않도록 가장자리 여백을 남긴다
  return { x: clamp(x, 4, 96), y: clamp(y, 6, 94) };
}

/** 목업 좌표 생성 — 장소 검색 결과가 없는 수기 입력에 쓴다 */
export function fallbackCoordinate(seed: string): {
  latitude: number;
  longitude: number;
} {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  }
  const { minLat, maxLat, minLng, maxLng } = MAP_BOUNDS;
  const latRatio = (hash % 1000) / 1000;
  const lngRatio = (Math.floor(hash / 1000) % 1000) / 1000;
  return {
    latitude: Number((minLat + (maxLat - minLat) * latRatio).toFixed(6)),
    longitude: Number((minLng + (maxLng - minLng) * lngRatio).toFixed(6)),
  };
}
