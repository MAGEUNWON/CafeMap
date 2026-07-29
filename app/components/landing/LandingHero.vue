<script setup lang="ts">
import { formatDateDot } from "~/core/format";
import { mockCafes } from "~/data/mockCafes";

/**
 * 히어로 미리보기는 장식 일러스트가 아니라 실제 화면 조각이다.
 * 지도와 마커는 서비스에서 쓰는 컴포넌트를 그대로 쓴다.
 */
const previewCafes = mockCafes.slice(0, 6);
const highlighted = mockCafes[0];
</script>

<template>
  <section class="container-content pb-14 pt-10 sm:pb-20 sm:pt-16">
    <div
      class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-14"
    >
      <div>
        <h1 class="text-display text-ink sm:text-display-lg">
          내가 다녀온 카페<br />기억하기
        </h1>
        <p class="mt-5 max-w-[26rem] text-body-1 text-ink-soft">
          이름, 위치, 사진, 분위기까지 한곳에 남겨두기
        </p>

        <div class="mt-8 flex flex-wrap gap-2.5">
          <UiButton to="/map" size="lg">내 카페 지도</UiButton>
          <UiButton to="/cafes/new" variant="outline" size="lg">
            카페 기록하기
          </UiButton>
        </div>
      </div>

      <!-- 제품 미리보기 -->
      <div class="relative">
        <div
          class="relative aspect-[4/3] overflow-hidden rounded-card border border-line shadow-soft sm:aspect-[16/11]"
        >
          <CafeMap
            :cafes="previewCafes"
            :selected-id="highlighted?.id ?? null"
            preview
          />
        </div>

        <!-- 지도 위에 얹히는 기록 카드 -->
        <article
          v-if="highlighted"
          class="absolute -bottom-6 left-4 right-4 z-30 rounded-card border border-line bg-paper p-3.5 shadow-lift sm:left-auto sm:right-6 sm:w-[292px]"
        >
          <div class="flex gap-3.5">
            <span
              class="block h-16 w-16 shrink-0 overflow-hidden rounded-field bg-sand-100"
            >
              <img
                :src="highlighted.photoUrl"
                :alt="`${highlighted.name} 기록 사진`"
                class="h-full w-full object-cover"
              />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-caption text-index text-ink-faint">
                {{ formatDateDot(highlighted.visitedAt) }}
              </span>
              <span class="mt-0.5 block truncate text-title-3 text-ink">
                {{ highlighted.name }}
              </span>
              <span class="mt-0.5 block truncate text-body-2 text-ink-soft">
                {{ highlighted.district }}
              </span>
            </span>
          </div>
          <div class="mt-3 flex flex-wrap gap-1.5">
            <AtmosphereTag
              v-for="tag in highlighted.atmosphere"
              :key="tag"
              :value="tag"
            />
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
