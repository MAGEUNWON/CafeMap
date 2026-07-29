<script setup lang="ts">
import { atmosphereLabel, type Atmosphere } from "~/types/cafe";

/**
 * 분위기 태그. 읽기 전용(span)과 선택형(button) 두 쓰임을 한 컴포넌트로 처리한다.
 * 기본은 연한 샌드, 선택된 상태는 짙은 브라운 + 밝은 텍스트.
 */
const props = withDefaults(
  defineProps<{
    value: Atmosphere;
    selected?: boolean;
    interactive?: boolean;
    size?: "sm" | "md";
  }>(),
  { selected: false, interactive: false, size: "sm" },
);

const emit = defineEmits<{ toggle: [value: Atmosphere] }>();

const SIZE: Record<"sm" | "md", string> = {
  sm: "h-7 px-2.5 text-label-sm",
  md: "h-9 px-4 text-label",
};

const classes = computed(() => [
  "inline-flex items-center rounded-pill transition-colors duration-150 ease-soft",
  SIZE[props.size],
  props.selected
    ? "bg-walnut text-sand-50"
    : "bg-sand-100 text-ink-soft" +
      (props.interactive ? " hover:bg-sand-200 hover:text-ink" : ""),
]);

const label = computed(() => atmosphereLabel[props.value]);
</script>

<template>
  <button
    v-if="interactive"
    type="button"
    :class="classes"
    :aria-pressed="selected"
    @click="emit('toggle', value)"
  >
    {{ label }}
  </button>
  <span v-else :class="classes">{{ label }}</span>
</template>
