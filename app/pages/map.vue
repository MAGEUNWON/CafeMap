<script setup lang="ts">
import { IconPlus } from "@tabler/icons-vue";
import { useCafeStore } from "~/stores/cafe";
import type { Atmosphere } from "~/types/cafe";

definePageMeta({ layout: "default" });
useHead({ title: "내 카페 지도 — CafeMap" });

const store = useCafeStore();

/** 모바일 전용 지도/목록 전환 */
const view = ref<"map" | "list">("map");

const viewOptions = [
  { value: "map", label: "지도" },
  { value: "list", label: "목록" },
];

const cafes = computed(() => store.filtered);
const isEmptyLibrary = computed(
  () => store.isHydrated && store.records.length === 0,
);
const isNoResult = computed(
  () =>
    store.isHydrated && store.records.length > 0 && cafes.value.length === 0,
);

function onSelect(id: number) {
  store.select(store.selectedId === id ? null : id);
}

function onToggleTag(tag: Atmosphere) {
  store.toggleTag(tag);
}

onBeforeUnmount(() => store.select(null));
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <div class="container-content pt-7">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h1 class="text-title-1 text-ink">내 카페 지도</h1>
          <p class="mt-1 text-body-2 text-index text-ink-soft">
            카페 {{ cafes.length }}곳
          </p>
        </div>

        <UiButton
          to="/cafes/new"
          size="sm"
          class="hidden sm:inline-flex sm:shrink-0"
        >
          카페 추가
        </UiButton>
      </div>

      <div class="mt-5 flex flex-col gap-3">
        <CafeSearchField
          :model-value="store.keyword"
          label="카페 이름이나 동네 검색"
          @update:model-value="store.setKeyword"
        />

        <AtmosphereFilter
          :model-value="store.activeTags"
          @toggle="onToggleTag"
          @clear="store.clearTags"
        />
      </div>

      <div class="mt-4 lg:hidden">
        <UiSegmented
          v-model="view"
          :options="viewOptions"
          label="지도와 목록 전환"
        />
      </div>
    </div>

    <!-- 본문 -->
    <div
      class="container-content flex min-h-0 flex-1 flex-col gap-6 pb-8 pt-5 lg:flex-row"
    >
      <!-- 목록 — 데스크톱은 항상 왼쪽, 모바일은 '목록' 탭일 때만 (DOM 은 하나) -->
      <aside
        class="min-h-0 flex-col lg:flex lg:w-[368px] lg:shrink-0"
        :class="view === 'list' ? 'flex' : 'hidden'"
        aria-label="다녀온 카페 목록"
      >
        <div v-if="!store.isHydrated" class="flex flex-col gap-2">
          <UiSkeleton
            v-for="n in 4"
            :key="n"
            rounded="card"
            class="h-[100px] w-full"
          />
        </div>

        <UiEmptyState
          v-else-if="isEmptyLibrary"
          title="아직 기록한 카페가 없음"
          description="처음 기억하고 싶은 카페를 남겨보기"
        >
          <template #action>
            <UiButton to="/cafes/new" size="sm">카페 기록하기</UiButton>
          </template>
        </UiEmptyState>

        <UiEmptyState
          v-else-if="isNoResult"
          title="해당하는 카페가 없음"
          description="다른 이름이나 동네로 찾아보기"
        />

        <div v-else class="lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
          <CafeList
            :cafes="cafes"
            variant="row"
            :selected-id="store.selectedId"
            @select="onSelect"
          />
        </div>
      </aside>

      <!-- 지도 (모바일에서는 목록과 전환) -->
      <div
        class="relative min-h-[420px] flex-1 flex-col overflow-hidden rounded-card border border-line lg:flex"
        :class="view === 'map' ? 'flex' : 'hidden'"
      >
        <CafeMap
          :cafes="cafes"
          :selected-id="store.selectedId"
          @select="onSelect"
        >
          <span
            class="pointer-events-none absolute left-4 top-4 rounded-pill border border-line bg-paper/90 px-3.5 py-1.5 text-label-sm text-ink-soft backdrop-blur"
          >
            이 동네에서 다녀온 카페
          </span>
        </CafeMap>

        <!-- 선택한 카페 카드 -->
        <Transition
          enter-active-class="transition duration-200 ease-soft"
          leave-active-class="transition duration-150 ease-soft"
          enter-from-class="opacity-0 translate-y-3"
          leave-to-class="opacity-0 translate-y-3"
        >
          <div
            v-if="store.selected"
            class="absolute inset-x-3 bottom-3 z-30 sm:inset-x-4 sm:bottom-4 sm:max-w-[420px]"
          >
            <CafePreviewCard
              :cafe="store.selected"
              @close="store.select(null)"
            />
          </div>
        </Transition>

        <!-- 모바일 카페 추가 -->
        <NuxtLink
          v-if="!store.selected"
          to="/cafes/new"
          class="absolute bottom-4 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-pill bg-walnut text-sand-50 shadow-lift transition-colors duration-150 ease-soft hover:bg-walnut-deep sm:hidden"
          aria-label="카페 추가"
        >
          <IconPlus :size="24" :stroke-width="1.7" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
