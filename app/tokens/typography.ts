/**
 * 타이포 토큰.
 *
 * 위계는 굵기가 아니라 크기 + 자간으로 만든다.
 * 큰 제목일수록 자간을 조이고(-0.03em) 무게는 600 이하로 유지 — 편집 디자인 인상.
 */
export const fontFamily: Record<string, string[]> = {
  sans: [
    "Pretendard Variable",
    "Pretendard",
    "-apple-system",
    "BlinkMacSystemFont",
    "system-ui",
    "sans-serif",
  ],
};

type FontSizeEntry = [
  string,
  { lineHeight: string; letterSpacing: string; fontWeight: string },
];

export const tailwindFontSize: Record<string, FontSizeEntry> = {
  /** 랜딩 히어로 전용 */
  display: [
    "2.5rem",
    { lineHeight: "1.2", letterSpacing: "-0.035em", fontWeight: "600" },
  ],
  /** 데스크톱 히어로 */
  "display-lg": [
    "4rem",
    { lineHeight: "1.14", letterSpacing: "-0.04em", fontWeight: "600" },
  ],
  /** 페이지 제목 */
  "title-1": [
    "1.625rem",
    { lineHeight: "1.35", letterSpacing: "-0.03em", fontWeight: "600" },
  ],
  /** 섹션 제목 */
  "title-2": [
    "1.25rem",
    { lineHeight: "1.4", letterSpacing: "-0.025em", fontWeight: "600" },
  ],
  /** 카드 제목 */
  "title-3": [
    "1.0625rem",
    { lineHeight: "1.45", letterSpacing: "-0.02em", fontWeight: "600" },
  ],
  /** 본문 */
  "body-1": [
    "0.9375rem",
    { lineHeight: "1.65", letterSpacing: "-0.01em", fontWeight: "400" },
  ],
  /** 보조 본문 */
  "body-2": [
    "0.875rem",
    { lineHeight: "1.6", letterSpacing: "-0.01em", fontWeight: "400" },
  ],
  /** 캡션 */
  caption: [
    "0.8125rem",
    { lineHeight: "1.5", letterSpacing: "-0.005em", fontWeight: "400" },
  ],
  /** 버튼·태그 라벨 */
  label: [
    "0.875rem",
    { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "500" },
  ],
  "label-sm": [
    "0.75rem",
    { lineHeight: "1.2", letterSpacing: "0", fontWeight: "500" },
  ],
  /** 날짜·개수 등 인덱스형 텍스트 — 자간을 넓혀 아카이브 느낌 */
  index: [
    "0.75rem",
    { lineHeight: "1.2", letterSpacing: "0.08em", fontWeight: "500" },
  ],
};
