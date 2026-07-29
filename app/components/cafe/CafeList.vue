<script setup lang="ts">
import type { ComponentPublicInstance } from "vue";
import type { CafeRecord } from "~/types/cafe";

const props = withDefaults(
  defineProps<{
    cafes: CafeRecord[];
    variant?: "grid" | "row";
    selectedId?: number | null;
  }>(),
  { variant: "grid", selectedId: null },
);

const emit = defineEmits<{ select: [id: number] }>();

const items = ref<HTMLElement[]>([]);

function setItemRef(
  el: Element | ComponentPublicInstance | null,
  index: number,
) {
  if (el instanceof HTMLElement) items.value[index] = el;
}

// 지도 마커에서 선택이 넘어오면 목록도 해당 카드까지 스크롤한다
watch(
  () => props.selectedId,
  (id) => {
    if (props.variant !== "row" || id === null) return;
    const index = props.cafes.findIndex((cafe) => cafe.id === id);
    if (index < 0) return;
    nextTick(() => {
      items.value[index]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    });
  },
);
</script>

<template>
  <ul
    v-if="variant === 'grid'"
    class="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
  >
    <li v-for="cafe in cafes" :key="cafe.id">
      <CafeCard :cafe="cafe" variant="grid" />
    </li>
  </ul>

  <ul v-else class="flex flex-col gap-2">
    <li
      v-for="(cafe, index) in cafes"
      :key="cafe.id"
      :ref="(el) => setItemRef(el, index)"
    >
      <CafeCard
        :cafe="cafe"
        variant="row"
        :selected="selectedId === cafe.id"
        @select="emit('select', $event)"
      />
    </li>
  </ul>
</template>
