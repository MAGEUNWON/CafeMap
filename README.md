# Cafe Pin

내가 다녀온 카페 기억하기 — 이름, 위치, 사진, 분위기까지 한곳에 남겨두는 개인용 카페 아카이브.

Nuxt 3 · Vue 3 · TypeScript · Tailwind CSS · Pinia · 카카오 지도

## 실행

```bash
npm install
cp .env.example .env   # 카카오 지도 키를 채운다 (아래 참고)
npm run dev            # http://localhost:3000 (포트는 --port 로 바꿀 수 있다)
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

## 배포 (Vercel)

서버에서 할 일이 없어 `ssr: false` 로 두고 SPA 로 내보낸다. 완전 정적
(`nuxt generate`)은 쓰지 않는다 — nitro 의 `vercel-static` 프리셋은 SPA 캐치올
라우트를 만들지 않아 `/cafes/3` 직접 접속이 404 가 된다. 기본 `vercel` 프리셋은
`{"src": "/(.*)", "dest": "/__fallback"}` 을 자동으로 넣어준다.

1. [vercel.com](https://vercel.com) → GitHub 계정으로 가입 (Hobby, 무료)
2. **Add New → Project → Import** 에서 이 레포 선택. Nuxt 가 자동 인식되므로
   빌드 설정은 **그대로 둔다**
3. Deploy 누르기 **전에** Environment Variables 에 `NUXT_PUBLIC_KAKAO_MAP_KEY`
   추가 (Production/Preview/Development 모두 체크).
   ⚠️ 이 값은 **빌드 시점에** 번들에 구워진다. 키를 바꾸면 재배포해야 반영된다
4. Deploy → `https://<프로젝트>.vercel.app` 획득
5. **카카오 개발자센터 → 앱 설정 → 플랫폼 → Web** 에 그 주소를 추가
   (localhost 항목은 그대로 둔다). 안 하면 SDK 가 401 을 뱉고 화면에는
   "지도를 불러오지 못함" 만 뜬다
6. 배포 직후 네트워크 탭에서 `dapi.kakao.com/v2/maps/sdk.js` 가 200 인지 확인.
   `kakaoMapKey` 기본값이 빈 문자열이라 **키가 없어도 빌드는 성공한다**

프리뷰 배포(`*-git-*.vercel.app`)는 주소가 매번 달라지는데 카카오는 와일드카드
도메인을 지원하지 않는다. 프리뷰에서 지도가 안 뜨는 건 정상이다.

## 화면

| 라우트             | 설명                                                                   |
| ------------------ | ---------------------------------------------------------------------- |
| `/`                | 내 카페 지도(홈) — 모바일은 지도/목록 전환, 데스크톱은 좌 목록·우 지도 |
| `/map`             | `/` 로 리다이렉트 (옛 링크 호환)                                       |
| `/cafes`           | 다녀온 카페 — 사진 카드 그리드, 분위기 필터, 정렬                      |
| `/cafes/new`       | 카페 기록하기                                                          |
| `/cafes/[id]`      | 카페 상세 — 수정·삭제(확인 모달)                                       |
| `/cafes/[id]/edit` | 카페 기록 수정 (등록 폼 재사용)                                        |
| `/settings`        | 사용량, 기록 백업 내보내기·가져오기                                    |

## 구조

```
app/
├─ tokens/          디자인 토큰(색·타이포·radius·shadow) → tailwind.config.ts 로 주입
├─ types/cafe.ts    도메인 타입 + 분위기 라벨 (단일 정의처)
├─ repositories/    저장소 계약 + localStorage 구현
├─ stores/          Pinia — 화면이 데이터에 닿는 유일한 지점
├─ core/            format(날짜) · backup/schema(저장값 검증) · map/kakaoSdk(SDK 로더)
│                   · map/places(장소 검색) · map/labelLayout(이름표 겹침) · image/resize(사진 축소)
├─ components/
│  ├─ ui/           UiButton, UiModal, UiToaster … (프리픽스 `Ui`)
│  ├─ layout/       AppHeader, MobileBottomNavigation (프리픽스 `Layout`)
│  └─ cafe/         CafeMap, CafeMapMarker, CafeCard, CafeForm …
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

- 홈(`/`)은 곧 지도다. 로그인 없는 개인용 앱이라 소개용 랜딩은 두지 않는다 —
  옛 `/map` 주소는 `/` 로 리다이렉트된다. 저장소는 시드를 심지 않아 처음 열면 빈 상태로 시작한다.
- 저장값이 깨져도 **덮어쓰지 않는다.** 원본은 그대로 두고 사본을
  `cafemap.records.corrupt.<시각>` 으로 옮긴 뒤 경고 배너를 띄운다.
- 저장 포맷은 봉투(`app/types/backup.ts`). 배열만 있던 예전 값도 읽는다.
  `nextId` 덕에 최고 id 를 지워도 번호가 재사용되지 않는다.
- 업로드한 사진은 canvas 로 긴 변 1024px, JPEG 0.8 로 줄여 data URL 로 저장한다(localStorage 용량 방어).
  사진 한 장이 대략 135–335KB 라 5MB 한도에서 15–35건쯤이 한계다.
- 지도 이름표는 겹치면 자동으로 숨는다(`app/core/map/labelLayout.ts`).
  선택한 카페 이름은 겹쳐도 항상 보이고, 줌인하면 화면에 남은 마커는 전부 이름이 뜬다.
- `localStorage` 는 `onNuxtReady` 이후(`app/plugins/cafe.client.ts`) 읽는다.
  읽기 전에는 스켈레톤이 뜬다.
- 백업 파일과 저장값은 **같은 형식**이라, 내보낸 파일을 그대로 다시 가져올 수 있다.
  가져오기는 교체(replace)만 지원하고, 덮어쓰기 전에 지금 기록을 자동으로 먼저 내보낸다.
- 홈 화면에 추가하면 앱처럼 뜬다(`public/manifest.webmanifest`). 서비스 워커는 쓰지 않는다.
  아이콘은 `public/icon.svg` 한 장에서 뽑는다 — 새 의존성 없이 Playwright 로 렌더링했다.
- `app/plugins/00.kill-sw.client.ts` 는 **개발 환경 전용**이다. 나중에 PWA 를 붙이려면
  이 플러그인을 먼저 지워야 등록↔해제 무한 루프를 피한다.
