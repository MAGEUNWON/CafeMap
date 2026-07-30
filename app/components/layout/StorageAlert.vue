<script setup lang="ts">
import { IconAlertTriangle, IconX } from "@tabler/icons-vue";
import { useCafeStore } from "~/stores/cafe";

/**
 * 저장소를 읽지 못했을 때 띄우는 배너.
 *
 * 토스트로만 알리면 몇 초 뒤 사라져서, 목록이 비어 보이는 게 "기록이 없어서"인지
 * "읽지 못해서"인지 구분이 안 된다. 그 상태로 새 기록을 쓰면 예전 기록을
 * 덮어쓴 것처럼 보이므로 남아 있는 경고가 필요하다.
 */
const store = useCafeStore();
const retrying = ref(false);

async function retry() {
  retrying.value = true;
  try {
    await store.retryHydrate();
  } finally {
    retrying.value = false;
  }
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-soft"
    leave-active-class="transition duration-150 ease-soft"
    enter-from-class="opacity-0 -translate-y-2"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <div
      v-if="store.error"
      role="alert"
      class="border-b border-clay/30 bg-clay/10"
    >
      <div
        class="container-content flex flex-wrap items-center gap-x-4 gap-y-2 py-3"
      >
        <IconAlertTriangle
          :size="18"
          :stroke-width="1.7"
          class="shrink-0 text-clay"
        />

        <p class="min-w-0 flex-1 text-body-2 text-ink">
          {{ store.error }}
          <span class="text-ink-soft">
            — 저장된 내용은 지우지 않았음. 새 기록을 쓰기 전에 확인이 필요함
          </span>
        </p>

        <div class="flex shrink-0 items-center gap-2">
          <UiButton
            size="sm"
            variant="outline"
            :disabled="retrying"
            @click="retry"
          >
            다시 시도
          </UiButton>
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-pill text-ink-soft transition-colors duration-150 ease-soft hover:bg-sand-200"
            aria-label="경고 닫기"
            @click="store.dismissError()"
          >
            <IconX :size="16" :stroke-width="1.7" />
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
