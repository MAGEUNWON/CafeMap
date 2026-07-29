<script setup lang="ts">
import { useCafeStore } from "~/stores/cafe";
import { useToastStore } from "~/stores/toast";
import type { CafeInput } from "~/types/cafe";

definePageMeta({ layout: "form" });
useHead({ title: "카페 기록하기 — CafeMap" });

const store = useCafeStore();
const toast = useToastStore();

const submitting = ref(false);

async function onSubmit(input: CafeInput) {
  if (submitting.value) return;
  submitting.value = true;
  try {
    const record = await store.create(input);
    toast.success("카페 기록 완료");
    await navigateTo(`/cafes/${record.id}`);
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "저장하지 못함");
    submitting.value = false;
  }
}
</script>

<template>
  <div class="container-content py-7 sm:py-10">
    <div class="mx-auto max-w-form">
      <h1 class="text-title-1 text-ink">카페 기록하기</h1>

      <div class="mt-7">
        <CafeForm
          mode="create"
          :submitting="submitting"
          @submit="onSubmit"
          @cancel="navigateTo('/cafes')"
        />
      </div>
    </div>
  </div>
</template>
