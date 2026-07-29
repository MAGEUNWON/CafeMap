<script setup lang="ts">
withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
  }>(),
  { description: "", confirmLabel: "삭제", cancelLabel: "취소" },
);

const emit = defineEmits<{ confirm: []; close: [] }>();
</script>

<template>
  <UiModal
    :open="open"
    :title="title"
    :description="description"
    @close="emit('close')"
  >
    <div class="flex gap-2">
      <UiButton variant="outline" block @click="emit('close')">
        {{ cancelLabel }}
      </UiButton>
      <UiButton variant="danger" block @click="emit('confirm')">
        {{ confirmLabel }}
      </UiButton>
    </div>
  </UiModal>
</template>
