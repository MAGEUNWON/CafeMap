<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label: string;
    modelValue: string;
    type?: "text" | "date" | "search" | "email" | "password";
    placeholder?: string;
    required?: boolean;
    error?: string;
    hint?: string;
    /** 라벨을 화면에서 숨기고 스크린리더에만 남긴다 */
    hideLabel?: boolean;
  }>(),
  {
    type: "text",
    placeholder: "",
    required: false,
    error: "",
    hint: "",
    hideLabel: false,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const id = useId();
const errorId = computed(() => `${id}-error`);
const hintId = computed(() => `${id}-hint`);

const describedBy = computed(() => {
  const ids: string[] = [];
  if (props.error) ids.push(errorId.value);
  else if (props.hint) ids.push(hintId.value);
  return ids.length ? ids.join(" ") : undefined;
});
</script>

<template>
  <div>
    <label
      :for="id"
      :class="hideLabel ? 'sr-only' : 'mb-2 block text-label text-ink-soft'"
    >
      {{ label }}
      <span v-if="required" class="text-clay" aria-hidden="true">*</span>
    </label>

    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="describedBy"
      class="h-12 w-full rounded-field border bg-paper px-4 text-body-1 text-ink transition-colors duration-150 ease-soft placeholder:text-ink-faint"
      :class="error ? 'border-clay' : 'border-line hover:border-ink-faint'"
      @input="
        emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
    />

    <p v-if="error" :id="errorId" class="mt-2 text-caption text-clay">
      {{ error }}
    </p>
    <p v-else-if="hint" :id="hintId" class="mt-2 text-caption text-ink-faint">
      {{ hint }}
    </p>
  </div>
</template>
