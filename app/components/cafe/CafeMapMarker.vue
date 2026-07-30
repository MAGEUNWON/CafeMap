<script setup lang="ts">
import type { CafeRecord } from "~/types/cafe";

/**
 * 지도 마커 — 좌표를 가리키는 월넛 리본 배너와 카페 이름.
 *
 * 사진 썸네일이었는데, 여러 장이 겹치면 오히려 어디가 어디인지 알기 어려웠다.
 * 사진은 목록·상세와 선택했을 때 뜨는 카드에서 충분히 보인다.
 * 흔한 물방울 핀 대신 책갈피 모양을 쓴다 — 기록을 꽂아둔다는 이 앱의 성격에 맞고,
 * 아래로 뾰족해 위치도 분명하다.
 *
 * 루트를 배너 크기(24×30)로 고정한 이유: 카카오 CustomOverlay 는 콘텐츠 상자
 * 크기로 앵커를 계산한다. 선택·호버·이름 길이로 상자가 커지면 끝점이
 * 좌표에서 밀리므로, 커지는 요소는 전부 흐름 밖(absolute)이나 transform 으로 둔다.
 */
const props = defineProps<{
  cafe: CafeRecord;
  selected: boolean;
  /** 겹침 계산이 이 마커의 이름을 보여도 된다고 판단했는지 */
  labelVisible: boolean;
}>();

const emit = defineEmits<{ select: [id: number] }>();

/** 선택한 카페 이름은 겹치더라도 항상 보인다 */
const showLabel = computed(() => props.selected || props.labelVisible);
</script>

<template>
  <div :data-cafe-marker="cafe.id" class="relative h-[30px] w-6 touch-none">
    <!--
      선택 표시 — 배너 뒤에 깔리는 옅은 원반. opacity 로만 토글해 크기는 불변.
      bottom-0.5 는 원반 중심(2+18=20px)을 배너 안쪽 표식(끝에서 20px)에 맞춘 값이다.
    -->
    <span
      aria-hidden="true"
      class="absolute bottom-0.5 left-1/2 h-9 w-9 -translate-x-1/2 rounded-pill bg-moss/25 transition-opacity duration-200 ease-soft"
      :class="selected ? 'opacity-100' : 'opacity-0'"
    />

    <!--
      -inset-2: 핀은 24×30 이라 손가락으로 누르기엔 작다. 탭 영역만 흐름 밖에서 넓힌다.
      pb-2 로 그만큼 되돌려야 핀 끝이 버튼 바닥이 아니라 루트 바닥(=좌표)에 놓인다.
    -->
    <button
      type="button"
      class="group absolute -inset-2 flex items-end justify-center rounded-pill pb-2"
      :aria-pressed="selected"
      :aria-label="`${cafe.name}, ${cafe.district}`"
      @click="emit('select', cafe.id)"
    >
      <!--
        origin-bottom: 끝점을 붙박아 두고 위로만 커지게 한다.
        transform 이라 레이아웃 크기가 그대로여서 앵커가 흔들리지 않는다.
      -->
      <span
        class="block origin-bottom transition-transform duration-200 ease-soft"
        :class="selected ? 'scale-125' : 'group-hover:scale-110'"
      >
        <svg
          viewBox="0 0 24 30"
          width="24"
          height="30"
          aria-hidden="true"
          class="block transition-colors duration-200 ease-soft"
          :class="selected ? 'fill-walnut-deep' : 'fill-walnut'"
        >
          <!--
            책갈피 — 위는 각진 어깨, 아래는 뾰족한 끝.
            끝점이 뷰박스 바닥 정중앙에 오도록 그린다 (앵커 계산의 전제).
            29.2 인 이유는 테두리 굵기 1.5 의 절반이 바깥으로 나가 30 에 닿기 때문.
          -->
          <path
            d="M5.4 2 h13.2 a1.6 1.6 0 0 1 1.6 1.6 v14.4 L12 29.2 L3.8 18 V3.6 A1.6 1.6 0 0 1 5.4 2 Z"
            class="stroke-paper"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
          <circle cx="12" cy="10" r="3" class="fill-paper" />
        </svg>
      </span>
    </button>

    <!--
      pointer-events-none 인 이유 세 가지:
      숨은 라벨이 클릭을 삼키지 않게, 옆 마커 위로 넘친 라벨이 그 핀을 막지 않게,
      라벨 위에서 끌면 지도가 그대로 따라오게.
      이름은 버튼의 aria-label 에 이미 있으므로 보조기기에는 감춘다.
    -->
    <span
      :data-cafe-label="cafe.id"
      aria-hidden="true"
      class="pointer-events-none absolute left-1/2 top-full mt-1.5 max-w-[8.5rem] -translate-x-1/2 overflow-hidden text-ellipsis whitespace-nowrap rounded-pill border px-2 py-0.5 text-label-sm transition-opacity duration-150 ease-soft"
      :class="[
        selected
          ? 'border-walnut bg-walnut text-sand-50'
          : 'border-line bg-paper/95 text-ink',
        showLabel ? 'opacity-100' : 'opacity-0',
      ]"
    >
      {{ cafe.name }}
    </span>
  </div>
</template>
