<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    modelValue: string;
    placeholder?: string;
    rows?: number;
    maxlength?: number;
  }>(),
  { placeholder: "", rows: 3, maxlength: 120 },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const id = useId();
</script>

<template>
  <div>
    <label :for="id" class="mb-2 block text-label text-ink-soft">
      {{ label }}
    </label>

    <textarea
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :maxlength="maxlength"
      class="w-full resize-none rounded-field border border-line bg-paper px-4 py-3 text-body-1 text-ink transition-colors duration-150 ease-soft placeholder:text-ink-faint hover:border-ink-faint"
      @input="
        emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)
      "
    />

    <p class="mt-2 text-right text-caption text-index text-ink-faint">
      {{ modelValue.length }} / {{ maxlength }}
    </p>
  </div>
</template>
