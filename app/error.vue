<script setup lang="ts">
import type { NuxtError } from "#app";

defineProps<{ error: NuxtError }>();
</script>

<template>
  <div
    class="flex min-h-[100dvh] flex-col items-center justify-center bg-sand-50 px-6 text-center"
  >
    <p class="text-caption text-index text-ink-faint">{{ error.statusCode }}</p>
    <h1 class="mt-2 text-title-1 text-ink">화면을 찾을 수 없음</h1>
    <p class="mt-2 text-body-2 text-ink-soft">주소를 다시 확인해보기</p>
    <UiButton class="mt-7" @click="clearError({ redirect: '/' })">
      홈으로
    </UiButton>
  </div>
</template>
