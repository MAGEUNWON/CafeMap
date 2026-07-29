# CafeMap

내가 다녀온 카페 기억하기 — 이름, 위치, 사진, 분위기까지 한곳에 남겨두는 개인용 카페 아카이브.

Nuxt 3 · Vue 3 · TypeScript · Tailwind CSS · Pinia

## 실행

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 프로덕션 빌드
npm run typecheck  # 타입 검사 (strict)
npm run format     # prettier
```

## 화면

| 라우트 | 설명 |
| --- | --- |
| `/` | 랜딩 — 히어로(실제 지도+기록 카드 미리보기), 핵심 기능, 최근 기록, CTA |
| `/map` | 내 카페 지도 — 모바일은 지도/목록 전환, 데스크톱은 좌 목록·우 지도 |
| `/cafes` | 다녀온 카페 — 사진 카드 그리드, 분위기 필터, 정렬 |
| `/cafes/new` | 카페 기록하기 |
| `/cafes/[id]` | 카페 상세 — 수정·삭제(확인 모달) |
| `/cafes/[id]/edit` | 카페 기록 수정 (등록 폼 재사용) |

## 구조

```
app/
├─ tokens/          디자인 토큰(색·타이포·radius·shadow) → tailwind.config.ts 로 주입
├─ types/cafe.ts    도메인 타입 + 분위기 라벨 (단일 정의처)
├─ data/            목업 카페 8곳, 목업 장소 검색
├─ repositories/    저장소 계약 + localStorage 구현
├─ stores/          Pinia — 화면이 데이터에 닿는 유일한 지점
├─ core/            format(날짜) · map/projection(좌표) · image/resize(사진 축소)
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
2. **지도** — `app/components/cafe/CafeMap.vue` 와 `app/core/map/projection.ts` 를 카카오/네이버 지도로 교체한다.
   `props(cafes, selectedId) / emit(select)` 계약만 지키면 페이지는 손대지 않아도 된다.
3. **장소 검색** — `app/data/mockPlaces.ts` 의 `searchPlaces()` 를 실제 장소 검색 API 호출로 바꾸고,
   응답을 `PlaceSuggestion` 으로 변환한다. `PlaceSearchField.vue` 는 그대로 쓴다.

## 메모

- 사진은 전부 `public/photos/*.svg` 의 추상 플레이스홀더다. 실제 카페 사진이 아니다.
- 업로드한 사진은 canvas 로 긴 변 1024px, JPEG 0.8 로 줄여 data URL 로 저장한다(localStorage 용량 방어).
- `localStorage` 는 하이드레이션이 끝난 뒤(`app/plugins/cafe.client.ts`) 읽는다. SSR 중에는 스켈레톤이 뜬다.
