<script setup lang="ts">
import { IconChevronDown } from "@tabler/icons-vue";

interface SelectOption {
  value: string;
  label: string;
}

withDefaults(
  defineProps<{
    label: string;
    modelValue: string;
    options: SelectOption[];
    hideLabel?: boolean;
  }>(),
  { hideLabel: false },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const id = useId();
</script>

<template>
  <div>
    <label
      :for="id"
      :class="hideLabel ? 'sr-only' : 'mb-2 block text-label text-ink-soft'"
    >
      {{ label }}
    </label>

    <div class="relative">
      <select
        :id="id"
        :value="modelValue"
        class="h-10 w-full appearance-none rounded-pill border border-line bg-paper pl-4 pr-9 text-label text-ink transition-colors duration-150 ease-soft hover:border-ink-faint"
        @change="
          emit('update:modelValue', ($event.target as HTMLSelectElement).value)
        "
      >
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      <IconChevronDown
        :size="16"
        :stroke-width="1.75"
        class="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
      />
    </div>
  </div>
</template>
