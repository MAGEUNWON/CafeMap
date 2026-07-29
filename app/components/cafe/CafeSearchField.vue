<script setup lang="ts">
import { IconSearch, IconX } from "@tabler/icons-vue";

withDefaults(
  defineProps<{
    modelValue: string;
    label: string;
    placeholder?: string;
  }>(),
  { placeholder: "카페 이름이나 동네 검색" },
);

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const id = useId();
</script>

<template>
  <div>
    <label :for="id" class="sr-only">{{ label }}</label>
    <div class="relative">
      <IconSearch
        :size="18"
        :stroke-width="1.6"
        class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint"
      />
      <input
        :id="id"
        type="search"
        :value="modelValue"
        :placeholder="placeholder"
        class="h-12 w-full rounded-pill border border-line bg-paper pl-11 pr-11 text-body-1 text-ink transition-colors duration-150 ease-soft placeholder:text-ink-faint hover:border-ink-faint"
        @input="
          emit('update:modelValue', ($event.target as HTMLInputElement).value)
        "
      />
      <button
        v-if="modelValue"
        type="button"
        class="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-pill text-ink-faint transition-colors duration-150 ease-soft hover:bg-sand-100 hover:text-ink"
        aria-label="검색어 지우기"
        @click="emit('update:modelValue', '')"
      >
        <IconX :size="16" :stroke-width="1.7" />
      </button>
    </div>
  </div>
</template>
