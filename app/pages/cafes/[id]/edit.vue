<script setup lang="ts">
import { useCafeStore } from "~/stores/cafe";
import { useToastStore } from "~/stores/toast";
import type { CafeInput } from "~/types/cafe";

definePageMeta({ layout: "form" });
useHead({ title: "카페 기록 수정 — Cafe Pin" });

const route = useRoute();
const store = useCafeStore();
const toast = useToastStore();

const id = computed(() => Number(route.params.id));
const cafe = computed(() => store.byId(id.value));
const isMissing = computed(() => store.isHydrated && !cafe.value);

const submitting = ref(false);

async function onSubmit(input: CafeInput) {
  if (submitting.value) return;
  submitting.value = true;
  try {
    await store.update(id.value, input);
    toast.success("카페 기록 수정 완료");
    await navigateTo(`/cafes/${id.value}`);
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "저장하지 못함");
    submitting.value = false;
  }
}
</script>

<template>
  <div class="container-content py-7 sm:py-10">
    <div class="mx-auto max-w-form">
      <h1 class="text-title-1 text-ink">카페 기록 수정</h1>

      <div v-if="!store.isHydrated" class="mt-7 flex flex-col gap-7">
        <UiSkeleton v-for="n in 3" :key="n" class="h-12 w-full" />
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

      <!-- 초기값이 준비된 뒤에 폼을 만든다 -->
      <div v-else-if="cafe" class="mt-7">
        <CafeForm
          mode="edit"
          :initial="cafe"
          :submitting="submitting"
          @submit="onSubmit"
          @cancel="navigateTo(`/cafes/${id}`)"
        />
      </div>
    </div>
  </div>
</template>
