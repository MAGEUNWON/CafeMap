<script setup lang="ts">
import { useCafeStore } from "~/stores/cafe";
import { cafeSortLabel, type Atmosphere, type CafeSort } from "~/types/cafe";

definePageMeta({ layout: "default" });
useHead({ title: "다녀온 카페 — Cafe Pin" });

const store = useCafeStore();

const sortOptions = (Object.keys(cafeSortLabel) as CafeSort[]).map((value) => ({
  value,
  label: cafeSortLabel[value],
}));

const cafes = computed(() => store.filtered);
const isEmptyLibrary = computed(
  () => store.isHydrated && store.records.length === 0,
);

function onSortChange(value: string) {
  store.setSort(value as CafeSort);
}

function onToggleTag(tag: Atmosphere) {
  store.toggleTag(tag);
}
</script>

<template>
  <div class="container-content py-7 sm:py-10">
    <header class="flex items-end justify-between gap-4">
      <div>
        <h1 class="text-title-1 text-ink">다녀온 카페</h1>
        <p class="mt-1 text-body-2 text-index text-ink-soft">
          카페 {{ cafes.length }}곳
        </p>
      </div>

      <UiButton
        to="/cafes/new"
        size="sm"
        class="hidden shrink-0 sm:inline-flex"
      >
        카페 기록하기
      </UiButton>
    </header>

    <div class="mt-6 flex flex-col gap-4">
      <CafeSearchField
        :model-value="store.keyword"
        label="카페 이름이나 동네 검색"
        @update:model-value="store.setKeyword"
      />

      <AtmosphereFilter
        :model-value="store.activeTags"
        title="분위기로 찾기"
        @toggle="onToggleTag"
        @clear="store.clearTags"
      />

      <div class="flex justify-end">
        <UiSelect
          label="정렬"
          hide-label
          :model-value="store.sort"
          :options="sortOptions"
          @update:model-value="onSortChange"
        />
      </div>
    </div>

    <div class="mt-8">
      <div
        v-if="!store.isHydrated"
        class="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div v-for="n in 6" :key="n">
          <UiSkeleton rounded="card" class="aspect-[4/3] w-full" />
          <UiSkeleton class="mt-4 h-3 w-20" />
          <UiSkeleton class="mt-2 h-4 w-32" />
        </div>
      </div>

      <UiEmptyState
        v-else-if="isEmptyLibrary"
        title="아직 기록한 카페가 없음"
        description="처음 기억하고 싶은 카페를 남겨보기"
      >
        <template #action>
          <UiButton to="/cafes/new">카페 기록하기</UiButton>
        </template>
      </UiEmptyState>

      <UiEmptyState
        v-else-if="cafes.length === 0"
        title="해당하는 카페가 없음"
        description="다른 이름이나 동네로 찾아보기"
      >
        <template #action>
          <UiButton variant="outline" size="sm" @click="store.resetFilters">
            필터 지우기
          </UiButton>
        </template>
      </UiEmptyState>

      <CafeList v-else :cafes="cafes" variant="grid" />
    </div>
  </div>
</template>
