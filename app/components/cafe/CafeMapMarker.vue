<script setup lang="ts">
import { projectToMap } from "~/core/map/projection";
import type { CafeRecord } from "~/types/cafe";

/**
 * 이 서비스의 마커는 물방울 핀이 아니라 그 카페 사진의 작은 썸네일이다.
 * 지도를 보는 것만으로 "아 여기가 그 카페" 가 떠오르게 하는 게 목적.
 */
const props = defineProps<{
  cafe: CafeRecord;
  selected: boolean;
}>();

const emit = defineEmits<{ select: [id: number] }>();

const point = computed(() =>
  projectToMap(props.cafe.latitude, props.cafe.longitude),
);
</script>

<template>
  <button
    type="button"
    class="absolute -translate-x-1/2 -translate-y-1/2 rounded-pill transition-[z-index] duration-0"
    :class="selected ? 'z-20' : 'z-10'"
    :style="{ left: `${point.x}%`, top: `${point.y}%` }"
    :aria-pressed="selected"
    :aria-label="`${cafe.name}, ${cafe.district}`"
    @click="emit('select', cafe.id)"
  >
    <span class="flex flex-col items-center gap-1.5">
      <span
        class="block overflow-hidden rounded-pill border-2 bg-sand-100 transition-all duration-200 ease-soft"
        :class="
          selected
            ? 'h-14 w-14 border-moss ring-4 ring-moss/20'
            : 'h-10 w-10 border-paper shadow-soft hover:h-12 hover:w-12'
        "
      >
        <img
          v-if="cafe.photoUrl"
          :src="cafe.photoUrl"
          :alt="`${cafe.name} 기록 사진`"
          class="h-full w-full object-cover"
        />
        <span
          v-else
          class="flex h-full w-full items-center justify-center bg-sand-200 text-label-sm text-ink-soft"
          aria-hidden="true"
        >
          {{ cafe.name.slice(0, 1) }}
        </span>
      </span>

      <span
        v-if="selected"
        class="whitespace-nowrap rounded-pill bg-walnut px-2.5 py-1 text-label-sm text-sand-50"
      >
        {{ cafe.name }}
      </span>
    </span>
  </button>
</template>
