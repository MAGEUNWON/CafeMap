<script setup lang="ts">
interface SegmentOption {
  value: string;
  label: string;
}

defineProps<{
  modelValue: string;
  options: SegmentOption[];
  /** 스크린리더용 그룹 이름 */
  label: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <div
    role="tablist"
    :aria-label="label"
    class="inline-flex rounded-pill border border-line bg-paper p-1"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="tab"
      :aria-selected="modelValue === option.value"
      class="h-9 min-w-[68px] rounded-pill px-4 text-label transition-colors duration-150 ease-soft"
      :class="
        modelValue === option.value
          ? 'bg-walnut text-sand-50'
          : 'text-ink-soft hover:bg-sand-100 hover:text-ink'
      "
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
