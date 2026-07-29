<script setup lang="ts">
type Variant = "solid" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const props = withDefaults(
  defineProps<{
    variant?: Variant;
    size?: Size;
    /** 지정하면 NuxtLink 로 렌더 */
    to?: string;
    type?: "button" | "submit";
    disabled?: boolean;
    block?: boolean;
  }>(),
  {
    variant: "solid",
    size: "md",
    to: undefined,
    type: "button",
    disabled: false,
    block: false,
  },
);

// 정적 매핑 — 클래스 문자열을 보간하면 Tailwind purge 에서 날아간다
const VARIANT: Record<Variant, string> = {
  solid:
    "bg-walnut text-sand-50 border border-walnut hover:bg-walnut-deep hover:border-walnut-deep active:bg-walnut-deep",
  outline:
    "bg-transparent text-ink border border-line hover:bg-sand-100 active:bg-sand-200",
  ghost:
    "bg-transparent text-ink-soft border border-transparent hover:bg-sand-100 hover:text-ink active:bg-sand-200",
  danger:
    "bg-transparent text-clay border border-clay/40 hover:bg-clay/10 active:bg-clay/20",
};

const SIZE: Record<Size, string> = {
  sm: "h-9 px-3.5 text-label-sm gap-1.5",
  md: "h-11 px-5 text-label gap-2",
  lg: "h-[52px] px-6 text-label gap-2",
};

const classes = computed(() => [
  "inline-flex items-center justify-center rounded-pill font-medium",
  "transition-colors duration-150 ease-soft",
  "disabled:opacity-45 disabled:pointer-events-none",
  VARIANT[props.variant],
  SIZE[props.size],
  props.block ? "w-full" : "",
]);
</script>

<template>
  <NuxtLink v-if="to && !disabled" :to="to" :class="classes">
    <slot />
  </NuxtLink>
  <button v-else :type="type" :disabled="disabled" :class="classes">
    <slot />
  </button>
</template>
