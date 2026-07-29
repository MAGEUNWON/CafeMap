<script setup lang="ts">
import { formatDateDot } from "~/core/format";
import { mockCafes } from "~/data/mockCafes";
import type { Atmosphere } from "~/types/cafe";

/** 아이콘 카드 3개 대신, 실제 화면 조각을 옆에 두고 설명한다 */
const photoSample = mockCafes[2];
const mapSample = mockCafes.slice(0, 5);
const tagSample: Atmosphere[] = [
  "quiet",
  "moody",
  "dessert",
  "work",
  "revisit",
];
</script>

<template>
  <section class="container-content">
    <div class="border-t border-line">
      <!-- 사진 -->
      <div
        class="grid gap-8 border-b border-line py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:items-start lg:gap-16 lg:py-16"
      >
        <div>
          <h2 class="text-title-1 text-ink">사진으로 기억하기</h2>
          <p class="mt-2 text-body-1 text-ink-soft">
            어떤 곳이었는지 한눈에 떠올리기
          </p>
        </div>

        <div v-if="photoSample" class="max-w-[420px] lg:ml-auto lg:w-full">
          <div
            class="aspect-[4/3] overflow-hidden rounded-card border border-line bg-sand-100"
          >
            <img
              :src="photoSample.photoUrl"
              :alt="`${photoSample.name} 기록 사진`"
              class="h-full w-full object-cover"
            />
          </div>
          <p class="mt-3.5 text-caption text-index text-ink-faint">
            {{ formatDateDot(photoSample.visitedAt) }}
          </p>
          <p class="mt-1 text-title-3 text-ink">{{ photoSample.name }}</p>
          <p class="mt-0.5 text-body-2 text-ink-soft">
            {{ photoSample.district }}
          </p>
        </div>
      </div>

      <!-- 지도 -->
      <div
        class="grid gap-8 border-b border-line py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:items-start lg:gap-16 lg:py-16"
      >
        <div class="lg:order-2">
          <h2 class="text-title-1 text-ink">지도에 남겨두기</h2>
          <p class="mt-2 text-body-1 text-ink-soft">
            이 동네에 다시 왔을 때 바로 찾기
          </p>
        </div>

        <div class="max-w-[420px] lg:order-1 lg:w-full">
          <div
            class="relative aspect-[4/3] overflow-hidden rounded-card border border-line"
          >
            <CafeMap :cafes="mapSample" preview />
          </div>
        </div>
      </div>

      <!-- 분위기 -->
      <div
        class="grid gap-8 border-b border-line py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:items-start lg:gap-16 lg:py-16"
      >
        <div>
          <h2 class="text-title-1 text-ink">분위기로 기억하기</h2>
          <p class="mt-2 text-body-1 text-ink-soft">
            조용함, 감성적, 디저트 맛집처럼 짧게 남기기
          </p>
        </div>

        <div class="max-w-[420px] lg:ml-auto lg:w-full">
          <div
            class="flex flex-wrap gap-2 rounded-card border border-line bg-paper p-6"
          >
            <AtmosphereTag
              v-for="tag in tagSample"
              :key="tag"
              :value="tag"
              size="md"
              :selected="tag === 'quiet' || tag === 'dessert'"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
