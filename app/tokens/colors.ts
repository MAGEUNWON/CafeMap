/**
 * 컬러 토큰 — 이 파일이 색상의 단일 정의처.
 * 컴포넌트에서 hex 를 직접 쓰지 않고 tailwind 클래스(bg-paper, text-ink ...)로만 사용한다.
 *
 * 톤 원칙: 순백/순흑 없음, 주황·황토 없음, 그라데이션 없음.
 */
export const palette = {
  /** 메인 배경 — 따뜻한 아이보리 */
  sand50: "#FAF7F1",
  /** 오트밀 — 기본 태그 배경, 지도 바탕 */
  sand100: "#F2ECE1",
  /** 눌린 상태, 스켈레톤 */
  sand200: "#E7DFD1",
  /** 카드 배경 — 배경보다 살짝 밝은 웜 화이트 */
  paper: "#FEFCF8",
  /** 구분선 — 저채도 베이지 그레이 */
  line: "#E3DCCF",
  /** 메인 텍스트 — 차콜 브라운 (sand50 대비 약 13:1) */
  ink: "#2E2823",
  /** 서브 텍스트 — 토프 그레이 (sand50 대비 약 5.2:1) */
  inkSoft: "#6E6459",
  /** 아주 흐린 보조 텍스트 — 캡션 전용, 큰 글자에만 */
  inkFaint: "#95897B",
  /** 주 포인트 — 짙은 월넛 브라운 */
  walnut: "#4A3B2E",
  /** 월넛 hover */
  walnutDeep: "#372A20",
  /** 보조 포인트 — 뮤트 그린 (선택 상태) */
  moss: "#6B7A5E",
  /** 선택 상태의 아주 옅은 면 */
  mossPale: "#EDF0E8",
  /** 위험(삭제) — 채도 낮춘 벽돌색 */
  clay: "#8C5B45",
} as const;

/** tailwind theme.extend.colors 로 그대로 전달되는 맵 */
export const tailwindColors = {
  sand: {
    50: palette.sand50,
    100: palette.sand100,
    200: palette.sand200,
  },
  paper: palette.paper,
  line: palette.line,
  ink: {
    DEFAULT: palette.ink,
    soft: palette.inkSoft,
    faint: palette.inkFaint,
  },
  walnut: {
    DEFAULT: palette.walnut,
    deep: palette.walnutDeep,
  },
  moss: {
    DEFAULT: palette.moss,
    pale: palette.mossPale,
  },
  clay: palette.clay,
} as const;
