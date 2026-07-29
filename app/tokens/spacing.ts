/** 모서리 반경 — 카드 16px, 입력 12px, 알약형은 완전 둥글게 */
export const borderRadius = {
  card: "16px",
  field: "12px",
  pill: "999px",
} as const;

/**
 * 그림자는 딱 하나만. 카드 구분은 여백과 얇은 테두리로 한다.
 * lift 는 떠 있는 요소(플로팅 버튼, 바텀시트, 모달)에만.
 */
export const boxShadow = {
  soft: "0 1px 2px rgba(46, 40, 35, 0.04)",
  lift: "0 6px 24px rgba(46, 40, 35, 0.10)",
} as const;

/** 콘텐츠 최대 폭 */
export const maxWidth = {
  content: "1200px",
  wide: "1440px",
  form: "560px",
} as const;
