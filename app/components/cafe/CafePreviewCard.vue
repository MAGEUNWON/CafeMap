<script setup lang="ts">
import { IconArrowRight, IconX } from "@tabler/icons-vue";
import { formatDateDot } from "~/core/format";
import type { CafeRecord } from "~/types/cafe";

/** 지도에서 마커를 고르면 뜨는 카드. 모바일에서는 바텀시트 자리에 붙는다. */
const props = defineProps<{ cafe: CafeRecord }>();

const emit = defineEmits<{ close: [] }>();

const visitedLabel = computed(() => formatDateDot(props.cafe.visitedAt));
</script>

<template>
  <article class="rounded-card border border-line bg-paper p-4 shadow-lift">
    <div class="flex gap-4">
      <div
        class="h-20 w-20 shrink-0 overflow-hidden rounded-field bg-sand-100 sm:h-24 sm:w-24"
      >
        <img
          v-if="cafe.photoUrl"
          :src="cafe.photoUrl"
          :alt="`${cafe.name} 기록 사진`"
          class="h-full w-full object-cover"
        />
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <p class="text-caption text-index text-ink-faint">
              {{ visitedLabel }}
            </p>
            <h3 class="mt-0.5 truncate text-title-3 text-ink">
              {{ cafe.name }}
            </h3>
            <p class="mt-0.5 truncate text-body-2 text-ink-soft">
              {{ cafe.address }}
            </p>
          </div>

          <button
            type="button"
            class="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-pill text-ink-faint transition-colors duration-150 ease-soft hover:bg-sand-100 hover:text-ink"
            aria-label="선택 해제"
            @click="emit('close')"
          >
            <IconX :size="18" :stroke-width="1.6" />
          </button>
        </div>

        <div
          v-if="cafe.atmosphere.length"
          class="mt-2.5 flex flex-wrap gap-1.5"
        >
          <AtmosphereTag
            v-for="tag in cafe.atmosphere"
            :key="tag"
            :value="tag"
          />
        </div>
      </div>
    </div>

    <p v-if="cafe.memo" class="mt-3 text-body-2 text-ink-soft">
      {{ cafe.memo }}
    </p>

    <NuxtLink
      :to="`/cafes/${cafe.id}`"
      class="mt-4 inline-flex h-10 items-center gap-1.5 rounded-pill border border-line px-4 text-label text-ink transition-colors duration-150 ease-soft hover:bg-sand-100"
    >
      기록 보기
      <IconArrowRight :size="16" :stroke-width="1.7" />
    </NuxtLink>
  </article>
</template>
