# CafeMap

내가 다녀온 카페 기억하기 — 이름, 위치, 사진, 분위기까지 한곳에 남겨두는 개인용 카페 아카이브.

Nuxt 3 · Vue 3 · TypeScript · Tailwind CSS · Pinia · 카카오 지도

## 실행

```bash
npm install
cp .env.example .env   # 카카오 지도 키를 채운다 (아래 참고)
npm run dev            # http://localhost:3000
npm run build          # 프로덕션 빌드
npm run typecheck      # 타입 검사 (strict)
npm run format         # prettier
```

## 카카오 지도 키

지도와 장소 검색에 카카오 지도 JavaScript 키가 필요하다. 키가 없어도 앱은 뜨지만
지도 자리에 "지도를 불러오지 못함" 안내가 뜬다.

1. [카카오 개발자센터](https://developers.kakao.com) → 내 애플리케이션 → **애플리케이션 추가하기**
2. **앱 키** 탭에서 **JavaScript 키** 복사 → `.env` 의 `NUXT_PUBLIC_KAKAO_MAP_KEY` 에 붙여넣기
3. **앱 설정 → 플랫폼 → Web** 에 사이트 도메인 등록 (`http://localhost:3000`, 배포하면 그 도메인도)
4. **제품 설정 → 카카오맵** 활성화 ON

JavaScript 키는 등록한 도메인에서만 동작해 브라우저에 노출되는 게 정상이지만,
`.env` 는 커밋하지 않는다.

## 화면

| 라우트             | 설명                                                                   |
| ------------------ | ---------------------------------------------------------------------- |
| `/`                | 랜딩 — 히어로(실제 지도+기록 카드 미리보기), 핵심 기능, 최근 기록, CTA |
| `/map`             | 내 카페 지도 — 모바일은 지도/목록 전환, 데스크톱은 좌 목록·우 지도     |
| `/cafes`           | 다녀온 카페 — 사진 카드 그리드, 분위기 필터, 정렬                      |
| `/cafes/new`       | 카페 기록하기                                                          |
| `/cafes/[id]`      | 카페 상세 — 수정·삭제(확인 모달)                                       |
| `/cafes/[id]/edit` | 카페 기록 수정 (등록 폼 재사용)                                        |

## 구조

```
app/
├─ tokens/          디자인 토큰(색·타이포·radius·shadow) → tailwind.config.ts 로 주입
├─ types/cafe.ts    도메인 타입 + 분위기 라벨 (단일 정의처)
├─ data/            목업 카페 8곳, 목업 장소 검색
├─ repositories/    저장소 계약 + localStorage 구현
├─ stores/          Pinia — 화면이 데이터에 닿는 유일한 지점
├─ core/            format(날짜) · map/kakaoSdk(SDK 로더) · map/places(장소 검색) · image/resize(사진 축소)
├─ components/
│  ├─ ui/           UiButton, UiModal, UiToaster … (프리픽스 `Ui`)
│  ├─ layout/       AppHeader, MobileBottomNavigation (프리픽스 `Layout`)
│  ├─ cafe/         CafeMap, CafeMapMarker, CafeCard, CafeForm …
│  └─ landing/      랜딩 섹션
└─ pages/
```

데이터 흐름은 한 방향이다.

```
pages / components → stores/cafe.ts → repositories → localStorage
```

화면 컴포넌트는 `localStorage` 를 직접 부르지 않는다.

## 백엔드 붙일 때

1. **기록 CRUD** — `app/repositories/apiCafeRepository.ts` 를 만들어 `CafeRepository` 를 구현하고,
   `app/stores/cafe.ts` 최상단의 `const repository = createLocalStorageCafeRepository()` 한 줄만 교체한다.
   메서드가 전부 `Promise` 라 스토어·화면 코드는 그대로 둔다.
2. **사진** — 지금은 리사이즈한 data URL 을 기록에 함께 저장한다. 스토리지가 생기면
   업로드 후 URL 만 `photoUrl` 에 넣도록 `PhotoUploader.vue` 를 바꾼다.

## 메모

- 사진은 전부 `public/photos/*.svg` 의 추상 플레이스홀더다. 실제 카페 사진이 아니다.
- 업로드한 사진은 canvas 로 긴 변 1024px, JPEG 0.8 로 줄여 data URL 로 저장한다(localStorage 용량 방어).
- `localStorage` 는 하이드레이션이 끝난 뒤(`app/plugins/cafe.client.ts`) 읽는다. SSR 중에는 스켈레톤이 뜬다.
