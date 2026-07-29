<script setup lang="ts">
import { ATMOSPHERE_FILTERS, type Atmosphere } from "~/types/cafe";

withDefaults(
  defineProps<{
    modelValue: Atmosphere[];
    /** 제목을 붙일지 — 지도 화면처럼 공간이 좁은 곳에선 끈다 */
    title?: string;
  }>(),
  { title: "" },
);

const emit = defineEmits<{
  toggle: [value: Atmosphere];
  clear: [];
}>();
</script>

<template>
  <section>
    <h2 v-if="title" class="mb-3 text-label text-ink-soft">{{ title }}</h2>

    <!-- 모바일에서는 가로 스크롤, 넓은 화면에선 자연스럽게 줄바꿈 -->
    <div
      class="-mx-5 flex gap-2 overflow-x-auto px-5 no-scrollbar sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
    >
      <button
        type="button"
        class="inline-flex h-9 shrink-0 items-center rounded-pill px-4 text-label transition-colors duration-150 ease-soft"
        :class="
          modelValue.length === 0
            ? 'bg-walnut text-sand-50'
            : 'bg-sand-100 text-ink-soft hover:bg-sand-200 hover:text-ink'
        "
        :aria-pressed="modelValue.length === 0"
        @click="emit('clear')"
      >
        전체
      </button>

      <AtmosphereTag
        v-for="tag in ATMOSPHERE_FILTERS"
        :key="tag"
        :value="tag"
        size="md"
        interactive
        :selected="modelValue.includes(tag)"
        class="shrink-0"
        @toggle="emit('toggle', $event)"
      />
    </div>
  </section>
</template>
