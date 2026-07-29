<script setup lang="ts">
withDefaults(defineProps<{ rounded?: "card" | "field" | "pill" }>(), {
  rounded: "field",
});

const ROUNDED: Record<"card" | "field" | "pill", string> = {
  card: "rounded-card",
  field: "rounded-field",
  pill: "rounded-pill",
};
</script>

<template>
  <div
    aria-hidden="true"
    class="animate-pulse bg-sand-200"
    :class="ROUNDED[rounded]"
  />
</template>
