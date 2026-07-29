/**
 * 날짜 표기는 시간 정보 없이 짧게.
 * 카드에서는 dot 형식(2026. 06. 20.)을 기본으로 쓴다.
 */

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function parse(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** 2026. 06. 20. */
export function formatDateDot(value: string): string {
  const date = parse(value);
  if (!date) return "-";
  return `${date.getFullYear()}. ${pad(date.getMonth() + 1)}. ${pad(date.getDate())}.`;
}

/** 6월 20일 */
export function formatDateKo(value: string): string {
  const date = parse(value);
  if (!date) return "-";
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

/** 2026년 6월 */
export function formatMonthKo(value: string): string {
  const date = parse(value);
  if (!date) return "-";
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

/** <input type="date"> 에 넣을 오늘 날짜 */
export function todayInputValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
