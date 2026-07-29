<script setup lang="ts">
import { IconArrowLeft, IconExternalLink } from "@tabler/icons-vue";
import { formatDateDot } from "~/core/format";
import { useCafeStore } from "~/stores/cafe";
import { useToastStore } from "~/stores/toast";

definePageMeta({ layout: "default" });

const route = useRoute();
const store = useCafeStore();
const toast = useToastStore();

const id = computed(() => Number(route.params.id));
const cafe = computed(() => store.byId(id.value));
const isMissing = computed(() => store.isHydrated && !cafe.value);

const confirmOpen = ref(false);
const removing = ref(false);

useHead(() => ({
  title: cafe.value ? `${cafe.value.name} — CafeMap` : "카페 기록 — CafeMap",
}));

async function onRemove() {
  if (removing.value) return;
  removing.value = true;
  try {
    await store.remove(id.value);
    confirmOpen.value = false;
    toast.success("카페 기록 삭제 완료");
    await navigateTo("/cafes");
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "삭제하지 못함");
    removing.value = false;
  }
}

// 지도 앱 연결은 다음 단계 — 지금은 눌리는 것까지만
function onOpenInMapApp() {
  toast.success("지도 앱 연결은 아직 준비 중");
}
</script>

<template>
  <div class="container-content py-6 sm:py-10">
    <div class="mx-auto max-w-[680px]">
      <NuxtLink
        to="/cafes"
        class="inline-flex h-10 items-center gap-1.5 rounded-pill pr-3 text-label text-ink-soft transition-colors duration-150 ease-soft hover:text-ink"
      >
        <IconArrowLeft :size="17" :stroke-width="1.7" />
        다녀온 카페
      </NuxtLink>

      <!-- 로딩 -->
      <div v-if="!store.isHydrated" class="mt-4">
        <UiSkeleton rounded="card" class="aspect-[4/3] w-full" />
        <UiSkeleton class="mt-6 h-6 w-40" />
        <UiSkeleton class="mt-3 h-4 w-56" />
      </div>

      <UiEmptyState
        v-else-if="isMissing"
        title="기록을 찾을 수 없음"
        description="목록에서 다시 골라보기"
      >
        <template #action>
          <UiButton to="/cafes" variant="outline" size="sm">
            다녀온 카페
          </UiButton>
        </template>
      </UiEmptyState>

      <article v-else-if="cafe" class="mt-4">
        <div
          class="aspect-[4/3] overflow-hidden rounded-card border border-line bg-sand-100 sm:aspect-[16/10]"
        >
          <img
            v-if="cafe.photoUrl"
            :src="cafe.photoUrl"
            :alt="`${cafe.name} 기록 사진`"
            class="h-full w-full object-cover"
          />
          <span
            v-else
            class="flex h-full w-full items-center justify-center text-caption text-ink-faint"
          >
            사진 없음
          </span>
        </div>

        <header class="mt-7">
          <h1 class="text-title-1 text-ink">{{ cafe.name }}</h1>
          <p class="mt-1.5 text-body-2 text-ink-soft">{{ cafe.address }}</p>
        </header>

        <!-- 기록 본문 — 상자 대신 얇은 선으로 항목을 나눈다 -->
        <dl class="mt-8 border-t border-line">
          <div class="flex gap-5 border-b border-line py-4">
            <dt class="w-[84px] shrink-0 text-caption text-ink-faint">
              다녀온 날
            </dt>
            <dd class="text-body-1 text-index text-ink">
              {{ formatDateDot(cafe.visitedAt) }}
            </dd>
          </div>

          <div
            v-if="cafe.atmosphere.length"
            class="flex gap-5 border-b border-line py-4"
          >
            <dt class="w-[84px] shrink-0 pt-0.5 text-caption text-ink-faint">
              기억한 분위기
            </dt>
            <dd class="flex flex-wrap gap-1.5">
              <AtmosphereTag
                v-for="tag in cafe.atmosphere"
                :key="tag"
                :value="tag"
              />
            </dd>
          </div>

          <div v-if="cafe.memo" class="flex gap-5 border-b border-line py-4">
            <dt class="w-[84px] shrink-0 text-caption text-ink-faint">
              남겨둔 메모
            </dt>
            <dd class="text-body-1 text-ink">{{ cafe.memo }}</dd>
          </div>
        </dl>

        <section class="mt-8">
          <h2 class="text-label text-ink-soft">카페 위치</h2>
          <div
            class="relative mt-3 aspect-[16/10] overflow-hidden rounded-card border border-line"
          >
            <CafeMap :cafes="[cafe]" :selected-id="cafe.id" preview />
          </div>

          <UiButton
            variant="outline"
            size="sm"
            class="mt-3"
            @click="onOpenInMapApp"
          >
            <IconExternalLink :size="16" :stroke-width="1.6" />
            지도에서 보기
          </UiButton>
        </section>

        <div class="mt-10 flex gap-2 border-t border-line pt-6">
          <UiButton
            :to="`/cafes/${cafe.id}/edit`"
            variant="outline"
            class="flex-1 sm:flex-none sm:px-8"
          >
            기록 수정
          </UiButton>
          <UiButton
            variant="danger"
            class="flex-1 sm:flex-none sm:px-8"
            @click="confirmOpen = true"
          >
            기록 삭제
          </UiButton>
        </div>
      </article>
    </div>

    <UiConfirmDialog
      :open="confirmOpen"
      title="이 카페 기록을 삭제할까?"
      description="삭제한 기록은 다시 되돌릴 수 없음"
      @confirm="onRemove"
      @close="confirmOpen = false"
    />
  </div>
</template>
