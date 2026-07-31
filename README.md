# Cafe Pin

내가 다녀온 카페 기억하기 — 이름, 위치, 사진, 분위기까지 한곳에 남겨두는 카페 아카이브.
폰 홈 화면에 앱처럼 꽂아 쓰고, 어느 기기에서든 로그인하면 같은 기록이 보인다.

Nuxt 3 · Vue 3 · TypeScript · Tailwind CSS · Pinia · 카카오 지도 · Supabase (PostgreSQL / Auth / Storage) · Vercel

## 주요 기능

- **지도가 곧 홈** — 앱을 열면 내가 기록한 카페들이 핀으로 찍힌 지도가 바로 뜬다.
  모바일은 지도/목록 전환, 데스크톱은 좌 목록·우 지도
- **기록** — 카카오 장소 검색으로 카페를 찾고 방문일·사진·분위기 태그·메모를 남긴다
- **계정 동기화** — 이메일 로그인. 기록·사진이 서버(Supabase)에 저장돼 기기·브라우저가 바뀌어도 유지된다.
  여러 명이 가입해도 각자 자기 기록만 본다(RLS)
- **백업** — 기록 전체를 JSON 으로 내보내고, 교체 또는 병합(중복 자동 제거)으로 가져온다
- **홈 화면 앱(PWA)** — 앱스토어 없이 "홈 화면에 추가"만으로 전체화면 앱처럼 열린다

## 사용 방법

1. 배포 주소에 접속해 **계정 만들기** (이메일 + 비밀번호 6자 이상, 즉시 로그인)
2. 아이폰이면 Safari 공유 버튼(📤) → **홈 화면에 추가** — 이후 아이콘으로 바로 연다.
   홈 화면 앱은 Safari 와 세션이 분리돼 있어 처음 한 번만 다시 로그인한다
3. 지도 우하단 **+** (또는 하단 내비 "추가")로 기록 시작
4. 백업·비밀번호 변경·로그아웃은 **설정(⚙️)** 에서. 비밀번호를 잊었으면 로그인 화면의
   "비밀번호를 잊었어요"로 재설정 메일을 받는다

## 실행

```bash
npm install
cp .env.example .env   # 카카오 지도 키 + Supabase 키를 채운다 (아래 참고)
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

## 백엔드 (Supabase)

기록·사진·계정은 Supabase 가 담당한다. `app/core/supabase.ts` 의 `BACKEND_ENABLED`
상수가 스위치다 — `false` 로 내리면 로그인 없이 localStorage 에 저장하는 로컬 모드로
돌아간다 (구현이 남아 있어 롤백·오프라인 개발용으로 쓸 수 있다).

새 Supabase 프로젝트에 연결하려면:

1. [supabase.com](https://supabase.com) 에서 프로젝트 생성 (리전 Seoul 권장)
   → `supabase/schema.sql` 을 SQL Editor 에서 실행 (테이블 + RLS + 사진 버킷 정책)
2. Connect(또는 Project Settings → Data API / API Keys)의 URL·publishable 키를
   `.env` 와 Vercel 환경변수에 (`NUXT_PUBLIC_SUPABASE_URL`, `NUXT_PUBLIC_SUPABASE_ANON_KEY`).
   빌드 시점에 번들에 구워지므로 키를 바꾸면 재배포해야 한다
3. **Authentication → Sign In / Providers → Email** 에서 "Confirm email" 은 꺼둔다
   (가입 즉시 로그인; 켜면 내장 메일러 한도·스팸함 이슈를 감수해야 한다)
4. **Authentication → URL Configuration** — Site URL 에 프로덕션 주소,
   Redirect URLs 에 `https://<프로덕션>/reset` (비밀번호 재설정 메일이 돌아올 곳)

무료 티어의 7일 미사용 일시정지는 Vercel cron(`vercel.json` → `/api/keepalive`)이 막는다.
anon(publishable) 키는 브라우저 노출이 정상 — 데이터 방어선은 RLS 다.

## 배포 (Vercel)

서버에서 할 일이 거의 없어 `ssr: false` SPA 로 내보낸다. 완전 정적(`nuxt generate`)은
쓰지 않는다 — nitro 의 `vercel-static` 프리셋은 SPA 캐치올 라우트를 만들지 않아
`/cafes/3` 직접 접속이 404 가 된다. 기본 `vercel` 프리셋은 캐치올을 자동으로 넣어준다.

1. [vercel.com](https://vercel.com) → GitHub 계정으로 가입 → **Add New → Project → Import** 에서 이 레포 선택.
   Nuxt 가 자동 인식되므로 빌드 설정은 **그대로 둔다**
2. Environment Variables 에 `NUXT_PUBLIC_KAKAO_MAP_KEY`, `NUXT_PUBLIC_SUPABASE_URL`,
   `NUXT_PUBLIC_SUPABASE_ANON_KEY` 추가 (Production/Preview/Development 모두 체크)
3. Deploy → `https://<프로젝트>.vercel.app` 획득
4. 그 주소를 **카카오 개발자센터 플랫폼 Web 도메인**과 **Supabase URL Configuration** 에 등록
5. 배포 직후 네트워크 탭에서 `dapi.kakao.com/v2/maps/sdk.js` 가 200 인지 확인.
   키 기본값이 빈 문자열이라 **키가 없어도 빌드는 성공한다** — 실패가 조용하다

프리뷰 배포(`*-git-*.vercel.app`)는 주소가 매번 달라지는데 카카오는 와일드카드
도메인을 지원하지 않는다. 프리뷰에서 지도가 안 뜨는 건 정상이다.

## 화면

| 라우트             | 설명                                                                   |
| ------------------ | ---------------------------------------------------------------------- |
| `/`                | 내 카페 지도(홈) — 모바일은 지도/목록 전환, 데스크톱은 좌 목록·우 지도 |
| `/login`           | 로그인·계정 만들기, 비밀번호 재설정 메일 요청                          |
| `/reset`           | 재설정 메일 링크가 도착하는 곳 — 새 비밀번호 설정                      |
| `/map`             | `/` 로 리다이렉트 (옛 링크 호환)                                       |
| `/cafes`           | 다녀온 카페 — 사진 카드 그리드, 분위기 필터, 정렬                      |
| `/cafes/new`       | 카페 기록하기                                                          |
| `/cafes/[id]`      | 카페 상세 — 수정·삭제, 카카오맵으로 열기                               |
| `/cafes/[id]/edit` | 카페 기록 수정 (등록 폼 재사용)                                        |
| `/settings`        | 계정(비밀번호 변경·로그아웃), 기록 백업 내보내기·가져오기              |

## 구조

```
app/
├─ tokens/          디자인 토큰(색·타이포·radius·shadow) → tailwind.config.ts 로 주입
├─ types/           도메인 타입(cafe.ts) + 백업 봉투(backup.ts) — 단일 정의처
├─ repositories/    저장소 계약(cafeRepository) + Supabase 구현 + localStorage 구현
├─ stores/          Pinia — cafe(기록), auth(로그인). 화면이 데이터에 닿는 유일한 지점
├─ middleware/      auth.global — 미로그인 → /login
├─ core/            supabase(클라이언트·백엔드 스위치) · backup/(검증·병합) · map/(SDK·검색·이름표)
│                   · image/resize(사진 축소) · format(날짜)
├─ components/
│  ├─ ui/           UiButton, UiModal, UiToaster … (프리픽스 `Ui`)
│  ├─ layout/       AppHeader, MobileBottomNavigation (프리픽스 `Layout`)
│  └─ cafe/         CafeMap, CafeMapMarker, CafeCard, CafeForm …
├─ pages/
server/api/         keepalive (Supabase 절전 방지 cron 대상)
supabase/           schema.sql — 테이블·RLS·버킷 정책
```

데이터 흐름은 한 방향이다.

```
pages / components → stores → repositories → Supabase (로컬 모드에선 localStorage)
```

화면 컴포넌트는 Supabase 나 localStorage 를 직접 부르지 않는다. 저장소 교체는
`BACKEND_ENABLED` 상수 하나로 끝난다 — localStorage 에서 Supabase 로 넘어올 때
화면·스토어 코드는 바뀌지 않았다.

## 메모

- 홈(`/`)은 곧 지도다. 소개용 랜딩은 두지 않는다 — 옛 `/map` 주소는 `/` 로 리다이렉트된다.
  시드 데이터를 심지 않아 처음엔 빈 상태로 시작한다.
- 사진은 canvas 로 긴 변 1024px, JPEG 0.8 로 줄인 뒤 Storage 버킷(`cafe-photos`)에
  올리고 기록에는 URL 만 남는다. 기록을 지우거나 사진을 바꾸면 이전 파일도 정리한다.
- 백업 파일은 봉투 형식(`app/types/backup.ts`) — 저장 스키마와 같은 형식이라 내보낸
  파일을 그대로 다시 가져올 수 있고, localStorage 시절 백업을 가져오면 data URL 사진이
  자동으로 Storage 에 업로드된다(로컬 → 서버 이관 경로).
- 가져오기는 **교체**와 **병합**(이름+방문일+좌표 자연키로 중복 제거, id 재발급)을
  지원한다. 교체 전에는 지금 기록을 자동으로 먼저 내보낸다.
- **폼 컨트롤은 반드시 `text-input` 토큰(16px)을 쓴다** — iOS 는 16px 미만 입력창에
  포커스하면 화면을 자동 확대하고, 그 확대가 남아 가로 스크롤처럼 보인다. 실기기에서 겪은 함정.
- `html` 에 `overflow-x: clip` 안전망이 있어 어떤 요소가 새어 나가도 페이지 전체
  가로 스크롤은 생기지 않는다.
- 지도 이름표는 겹치면 자동으로 숨는다(`app/core/map/labelLayout.ts`).
  선택한 카페 이름은 겹쳐도 항상 보인다.
- 로컬 모드 한정: 저장값이 깨져도 **덮어쓰지 않는다** — 원본을
  `cafemap.records.corrupt.<시각>` 으로 보존하고 경고 배너를 띄운다.
  localStorage 5MB 한도 기준 사진 포함 15–35건이 한계라 설정에 용량 게이지가 뜬다
  (서버 모드에선 자동으로 숨김).
- 홈 화면에 추가하면 앱처럼 뜬다(`public/manifest.webmanifest`). 서비스 워커는 쓰지 않는다.
  아이콘은 `public/icon.svg` 한 장에서 뽑았다.
- `app/plugins/00.kill-sw.client.ts` 는 **개발 환경 전용**이다. 나중에 PWA(서비스 워커)를
  붙이려면 이 플러그인을 먼저 지워야 등록↔해제 무한 루프를 피한다.
