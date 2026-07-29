<script setup lang="ts">
import { useToastStore } from "~/stores/toast";

const toast = useToastStore();

const TONE: Record<"success" | "error", string> = {
  success: "bg-walnut text-sand-50",
  error: "bg-clay text-sand-50",
};
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+88px)] z-[60] flex flex-col items-center gap-2 px-5 sm:bottom-8"
    role="status"
    aria-live="polite"
  >
    <TransitionGroup
      enter-active-class="transition duration-200 ease-soft"
      leave-active-class="transition duration-150 ease-soft"
      enter-from-class="opacity-0 translate-y-2"
      leave-to-class="opacity-0"
    >
      <div
        v-for="item in toast.items"
        :key="item.id"
        class="pointer-events-auto rounded-pill px-5 py-3 text-label shadow-lift"
        :class="TONE[item.tone]"
      >
        {{ item.message }}
      </div>
    </TransitionGroup>
  </div>
</template>
