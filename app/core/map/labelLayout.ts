/**
 * 지도 이름표 겹침 계산.
 *
 * DOM 도 kakao 도 모르는 순수 함수다. 부르는 쪽이 화면 좌표와 실측 크기를
 * 넘겨주면 어떤 이름표를 보여줄지만 정해서 돌려준다.
 *
 * 설계를 좌우한 관찰: **팬은 모든 마커를 같은 벡터로 옮기므로 이미 화면에 있는
 * 것들끼리의 겹침은 바꾸지 못한다.** 그래서 드래그하는 동안 매 프레임 다시
 * 계산할 필요가 없고, 멈춘 뒤 한 번만 돌리면 된다.
 *
 * 다만 팬으로 새 마커가 화면에 들어오면 후보가 늘어 순위가 다시 매겨지므로
 * 이름표 구성은 바뀔 수 있다. 같은 자리로 돌아오면 같은 결과가 나온다.
 */

/** 지도 컨테이너 좌상단 기준 px 사각형 */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LabelCandidate {
  id: number;
  /** 컨테이너 좌표에서 이 카페의 좌표가 찍히는 지점 = 핀 끝 */
  x: number;
  y: number;
  /** 이름 알약 실측 크기 */
  labelWidth: number;
  labelHeight: number;
  /** 선택된 카페 — 겹쳐도 무조건 보이고 자리를 가장 먼저 잡는다 */
  forced: boolean;
  /** 커져 있는 핀은 자리도 그만큼 차지한다 */
  pinScale: number;
}

export const PIN_WIDTH = 24;
export const PIN_HEIGHT = 30;
/** 핀 끝과 이름 알약 사이 (마커의 mt-1.5) */
export const LABEL_GAP = 6;
/** 알약끼리 아슬아슬하게 붙지 않도록 부풀리는 여백 */
export const LABEL_MARGIN = 3;
/** 화면 밖 이만큼까지는 계산에 넣는다 — 가장자리에서 이름표가 튀어나오는 걸 줄인다 */
export const CULL_MARGIN = 80;

function intersects(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function pinRect(candidate: LabelCandidate): Rect {
  const width = PIN_WIDTH * candidate.pinScale;
  const height = PIN_HEIGHT * candidate.pinScale;
  // 핀은 끝점 기준으로 위쪽에 그려진다
  return { x: candidate.x - width / 2, y: candidate.y - height, width, height };
}

function labelRect(candidate: LabelCandidate): Rect {
  return {
    x: candidate.x - candidate.labelWidth / 2 - LABEL_MARGIN,
    y: candidate.y + LABEL_GAP - LABEL_MARGIN,
    width: candidate.labelWidth + LABEL_MARGIN * 2,
    height: candidate.labelHeight + LABEL_MARGIN * 2,
  };
}

/**
 * 보여줄 이름표를 정한다.
 *
 * 우선순위대로 훑으면서 이미 잡힌 자리와 안 겹치는 것만 남긴다.
 * 시작 시점에 **모든 핀의 자리를 미리 예약**하는 게 핵심 — 이름표가 옆 카페의
 * 핀을 덮는 게 겹침 중에서 제일 알아보기 어렵다.
 */
export function resolveVisibleLabels(
  candidates: readonly LabelCandidate[],
  viewport: { width: number; height: number },
): Set<number> {
  const visible = new Set<number>();

  const onScreen = candidates.filter((candidate) => {
    const label = labelRect(candidate);
    const pin = pinRect(candidate);
    const top = Math.min(pin.y, label.y);
    const bottom = Math.max(pin.y + pin.height, label.y + label.height);
    const left = Math.min(pin.x, label.x);
    const right = Math.max(pin.x + pin.width, label.x + label.width);
    return (
      right >= -CULL_MARGIN &&
      left <= viewport.width + CULL_MARGIN &&
      bottom >= -CULL_MARGIN &&
      top <= viewport.height + CULL_MARGIN
    );
  });

  // 위에서 아래로. y 순서는 팬·줌에 불변이라 움직여도 승자가 안 바뀐다 =
  // 이름표가 깜빡이지 않는다. 선택된 것만 맨 앞으로 끌어올린다.
  const ordered = [...onScreen].sort((a, b) => {
    if (a.forced !== b.forced) return a.forced ? -1 : 1;
    if (a.y !== b.y) return a.y - b.y;
    return a.id - b.id;
  });

  const reserved: Rect[] = onScreen.map(pinRect);

  for (const candidate of ordered) {
    const rect = labelRect(candidate);
    if (candidate.forced) {
      visible.add(candidate.id);
      reserved.push(rect);
      continue;
    }
    if (reserved.some((taken) => intersects(rect, taken))) continue;
    visible.add(candidate.id);
    reserved.push(rect);
  }

  return visible;
}
