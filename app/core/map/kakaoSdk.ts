/**
 * 카카오 지도 SDK 로더.
 *
 * 한 화면에 지도가 여럿 뜰 수 있으므로(랜딩 히어로·피처·지도 페이지)
 * 모듈 레벨에서 Promise 를 캐시해 스크립트를 한 번만 받는다.
 */

// 프로토콜 상대 경로(//)로 두면 http 페이지에서 http 로 요청돼 브라우저가 막는다(ERR_BLOCKED_BY_ORB)
const SDK_URL = "https://dapi.kakao.com/v2/maps/sdk.js";

/** 장소 검색(services.Places)을 쓰려면 services 라이브러리가 필요하다 */
const LIBRARIES = "services";

let pending: Promise<void> | null = null;

export class KakaoMapLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KakaoMapLoadError";
  }
}

export function loadKakaoMaps(appKey: string): Promise<void> {
  if (pending) return pending;

  pending = new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new KakaoMapLoadError("지도는 브라우저에서만 불러올 수 있음"));
      return;
    }

    if (!appKey) {
      reject(new KakaoMapLoadError("카카오 지도 키가 없음"));
      return;
    }

    // 이미 다른 경로로 올라와 있으면 그대로 쓴다
    if (typeof kakao !== "undefined" && kakao.maps?.Map) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `${SDK_URL}?appkey=${appKey}&libraries=${LIBRARIES}&autoload=false`;
    script.async = true;
    // autoload=false 라 load() 콜백이 와야 kakao.maps 를 쓸 수 있다
    script.onload = () => kakao.maps.load(() => resolve());
    script.onerror = () =>
      reject(new KakaoMapLoadError("카카오 지도를 불러오지 못함"));

    document.head.appendChild(script);
  });

  // 실패했으면 캐시를 비워 다음 시도에서 다시 받게 한다
  pending.catch(() => {
    pending = null;
  });

  return pending;
}
