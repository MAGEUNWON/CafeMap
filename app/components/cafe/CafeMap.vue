<script setup lang="ts">
import { projectToMap } from "~/core/map/projection";
import type { CafeRecord } from "~/types/cafe";

/**
 * 지도 목업.
 *
 * 배경은 성수·서울숲 일대처럼 보이는 인라인 SVG 이고, 마커는 그 위에 얹은 HTML 이다.
 * 실제 카카오/네이버 지도를 붙일 때는 이 컴포넌트와 core/map/projection.ts 만 교체하면 된다.
 * (props/emit 계약은 그대로 두면 페이지 코드는 손댈 필요 없음)
 */
withDefaults(
  defineProps<{
    cafes: CafeRecord[];
    selectedId?: number | null;
    /** 마커를 누를 수 없는 미리보기 모드 (랜딩·상세 화면) */
    preview?: boolean;
  }>(),
  { selectedId: null, preview: false },
);

const emit = defineEmits<{ select: [id: number] }>();

/**
 * 도로를 선으로 긋는 대신, 밝은 바닥 위에 블록을 얹고 그 사이 틈을 길로 읽히게 한다.
 * 폭이 불규칙해야 격자가 기계적으로 보이지 않는다.
 */
const COLUMN_WIDTHS = [
  62, 44, 78, 54, 68, 48, 74, 58, 64, 50, 70, 46, 60, 76, 52, 66, 44, 72,
];
const ROW_HEIGHTS = [48, 62, 40, 56, 50, 66, 44, 54, 60, 42, 58, 50, 64, 46];
/** 3번째마다 큰길 */
const MAIN_GAP = 15;
const GAP = 7;

/** 지도에 얹는 지명 */
const AREA_LABELS = [
  { name: "서울숲", latitude: 37.5443, longitude: 127.0378 },
  { name: "뚝섬", latitude: 37.5479, longitude: 127.0468 },
  { name: "성수", latitude: 37.5452, longitude: 127.0602 },
];

interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
}

const blocks = computed<Block[]>(() => {
  const result: Block[] = [];
  let y = -120;

  ROW_HEIGHTS.forEach((height, rowIndex) => {
    let x = -160;
    COLUMN_WIDTHS.forEach((width, colIndex) => {
      result.push({ x, y, width, height });
      x += width + (colIndex % 3 === 2 ? MAIN_GAP : GAP);
    });
    y += height + (rowIndex % 3 === 1 ? MAIN_GAP : GAP);
  });

  return result;
});
</script>

<template>
  <!-- 부모가 relative 인 어떤 상자든 그대로 채운다 (h-full 은 min-height 만 있는 부모에서 0 이 된다) -->
  <div class="absolute inset-0 overflow-hidden bg-sand-100">
    <!--
      비율을 고정(slice)하면 지도가 잘려 마커·지명 좌표와 어긋난다.
      안에 든 건 전부 추상 도형이라 늘어나도 지도로 읽힌다.
    -->
    <svg
      class="absolute inset-0 h-full w-full"
      viewBox="0 0 1000 700"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <!-- 바닥이 길, 그 위의 블록 사이 틈이 골목 -->
      <rect width="1000" height="700" fill="#FBF7EF" />

      <g transform="rotate(-7 500 350)" fill="#E8DFCC">
        <rect
          v-for="(block, index) in blocks"
          :key="index"
          :x="block.x"
          :y="block.y"
          :width="block.width"
          :height="block.height"
        />
      </g>

      <!-- 서울숲 -->
      <path
        d="M-10 220 C90 196 190 210 236 258 C282 306 274 396 236 460 C196 528 96 560 -20 548 Z"
        fill="#DCE1D2"
      />

      <!-- 하천 -->
      <path
        d="M0 654 C216 630 404 672 642 644 C798 626 902 640 1000 622 L1000 700 L0 700 Z"
        fill="#DDE3E3"
      />

      <!-- 철도 -->
      <path
        d="M-20 430 C240 408 520 456 1020 398"
        stroke="#B3A48B"
        stroke-width="3"
        stroke-dasharray="11 8"
        fill="none"
      />
    </svg>

    <!-- 지명은 SVG 안에 두면 지도 축척에 따라 글자까지 늘어난다 -->
    <span
      v-for="label in AREA_LABELS"
      :key="label.name"
      class="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-label-sm tracking-[0.12em] text-ink-faint"
      :style="{
        left: `${projectToMap(label.latitude, label.longitude).x}%`,
        top: `${projectToMap(label.latitude, label.longitude).y}%`,
      }"
    >
      {{ label.name }}
    </span>

    <!-- 마커 -->
    <CafeMapMarker
      v-for="cafe in cafes"
      :key="cafe.id"
      :cafe="cafe"
      :selected="selectedId === cafe.id"
      :class="preview ? 'pointer-events-none' : ''"
      @select="emit('select', $event)"
    />

    <slot />
  </div>
</template>
