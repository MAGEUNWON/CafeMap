<script setup lang="ts">
import { formatDateDot } from "~/core/format";
import type { CafeRecord } from "~/types/cafe";

/**
 * grid — 사진 위, 글 아래. 테두리 없이 여백으로만 구분해 사진 일기처럼 읽히게 한다.
 * row  — 지도 옆 목록용 가로형. 선택 상태를 가진다.
 */
const props = withDefaults(
  defineProps<{
    cafe: CafeRecord;
    variant?: "grid" | "row";
    selected?: boolean;
  }>(),
  { variant: "grid", selected: false },
);

const emit = defineEmits<{ select: [id: number] }>();

const visitedLabel = computed(() => formatDateDot(props.cafe.visitedAt));
</script>

<template>
  <!-- 그리드형: 상세로 이동 -->
  <NuxtLink
    v-if="variant === 'grid'"
    :to="`/cafes/${cafe.id}`"
    class="group block"
  >
    <div
      class="aspect-[4/3] overflow-hidden rounded-card border border-line bg-sand-100"
    >
      <img
        v-if="cafe.photoUrl"
        :src="cafe.photoUrl"
        :alt="`${cafe.name} 기록 사진`"
        class="h-full w-full object-cover transition-transform duration-500 ease-soft group-hover:scale-[1.03]"
      />
      <span
        v-else
        class="flex h-full w-full items-center justify-center text-caption text-ink-faint"
      >
        사진 없음
      </span>
    </div>

    <p class="mt-4 text-caption text-index text-ink-faint">
      {{ visitedLabel }}
    </p>
    <h3
      class="mt-1 text-title-3 text-ink transition-colors duration-150 ease-soft group-hover:text-walnut"
    >
      {{ cafe.name }}
    </h3>
    <p class="mt-0.5 text-body-2 text-ink-soft">{{ cafe.district }}</p>

    <!-- 메모를 태그보다 위에 둬야 카드 여러 장이 나란히 놓였을 때 줄이 맞는다 -->
    <p v-if="cafe.memo" class="mt-2.5 text-body-2 text-ink-soft">
      {{ cafe.memo }}
    </p>

    <div v-if="cafe.atmosphere.length" class="mt-3 flex flex-wrap gap-1.5">
      <AtmosphereTag v-for="tag in cafe.atmosphere" :key="tag" :value="tag" />
    </div>
  </NuxtLink>

  <!-- 가로형: 지도와 선택 상태를 주고받는다 -->
  <button
    v-else
    type="button"
    class="flex w-full gap-3.5 rounded-card border p-3 text-left transition-colors duration-150 ease-soft"
    :class="
      selected
        ? 'border-moss bg-moss-pale'
        : 'border-line bg-paper hover:border-ink-faint'
    "
    :aria-pressed="selected"
    @click="emit('select', cafe.id)"
  >
    <span
      class="block h-[72px] w-[72px] shrink-0 overflow-hidden rounded-field bg-sand-100"
    >
      <img
        v-if="cafe.photoUrl"
        :src="cafe.photoUrl"
        :alt="`${cafe.name} 기록 사진`"
        class="h-full w-full object-cover"
      />
    </span>

    <span class="min-w-0 flex-1">
      <span class="block text-caption text-index text-ink-faint">
        {{ visitedLabel }}
      </span>
      <span class="mt-0.5 block truncate text-title-3 text-ink">
        {{ cafe.name }}
      </span>
      <span class="mt-0.5 block truncate text-body-2 text-ink-soft">
        {{ cafe.district }}
      </span>
      <span v-if="cafe.atmosphere.length" class="mt-2 flex flex-wrap gap-1.5">
        <AtmosphereTag
          v-for="tag in cafe.atmosphere.slice(0, 2)"
          :key="tag"
          :value="tag"
        />
      </span>
    </span>
  </button>
</template>
