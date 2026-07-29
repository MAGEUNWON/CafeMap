<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    description?: string;
  }>(),
  { description: "" },
);
</script>

<template>
  <div class="flex flex-col items-center px-6 py-16 text-center">
    <!-- 장식 대신 얇은 선 하나로 여백을 끊는다 -->
    <span class="mb-6 block h-px w-10 bg-line" aria-hidden="true" />
    <p class="text-title-3 text-ink">{{ title }}</p>
    <p v-if="description" class="mt-2 text-body-2 text-ink-soft">
      {{ description }}
    </p>
    <div v-if="$slots.action" class="mt-6">
      <slot name="action" />
    </div>
  </div>
</template>
