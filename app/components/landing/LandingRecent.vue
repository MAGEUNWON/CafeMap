<script setup lang="ts">
import { IconArrowRight } from "@tabler/icons-vue";
import { useCafeStore } from "~/stores/cafe";

const store = useCafeStore();

// 하이드레이션 전에 예시로 채우면 남의 카페가 내 기록인 것처럼 잠깐 떴다가
// 사라진다. 저장소를 읽을 때까지는 스켈레톤을 둔다.
const cafes = computed(() => store.recent.slice(0, 4));
</script>

<template>
  <section class="container-content py-14 sm:py-20">
    <header class="flex items-end justify-between gap-4">
      <div>
        <h2 class="text-title-1 text-ink">최근에 다녀온 카페</h2>
        <p class="mt-1.5 text-body-2 text-ink-soft">
          사진으로 다시 보는 내 카페 기록
        </p>
      </div>

      <NuxtLink
        to="/cafes"
        class="hidden h-10 shrink-0 items-center gap-1.5 rounded-pill px-4 text-label text-ink-soft transition-colors duration-150 ease-soft hover:bg-sand-100 hover:text-ink sm:inline-flex"
      >
        다녀온 카페
        <IconArrowRight :size="16" :stroke-width="1.7" />
      </NuxtLink>
    </header>

    <div
      v-if="!store.isHydrated"
      class="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4"
    >
      <UiSkeleton
        v-for="n in 4"
        :key="n"
        rounded="card"
        class="aspect-[4/3] w-full"
      />
    </div>

    <ul
      v-else-if="cafes.length"
      class="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4"
    >
      <li v-for="cafe in cafes" :key="cafe.id">
        <CafeCard :cafe="cafe" variant="grid" />
      </li>
    </ul>

    <UiEmptyState
      v-else
      title="아직 기록한 카페가 없음"
      description="처음 기억하고 싶은 카페를 남겨보기"
    >
      <template #action>
        <UiButton to="/cafes/new">카페 기록하기</UiButton>
      </template>
    </UiEmptyState>
  </section>
</template>
