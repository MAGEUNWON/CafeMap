<script setup lang="ts">
import { IconCamera, IconPhotoPlus, IconX } from "@tabler/icons-vue";
import { fileToResizedDataUrl } from "~/core/image/resize";
import { useToastStore } from "~/stores/toast";

const props = defineProps<{ modelValue: string }>();

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const toast = useToastStore();

const pickInput = ref<HTMLInputElement | null>(null);
const cameraInput = ref<HTMLInputElement | null>(null);
const isProcessing = ref(false);

const hasPhoto = computed(() => props.modelValue.length > 0);

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;

  isProcessing.value = true;
  try {
    emit("update:modelValue", await fileToResizedDataUrl(file));
  } catch {
    toast.error("사진을 불러오지 못함");
  } finally {
    isProcessing.value = false;
  }
}
</script>

<template>
  <div>
    <p class="mb-2 text-label text-ink-soft">사진</p>

    <div
      class="relative aspect-[4/3] overflow-hidden rounded-card border border-line bg-sand-100"
    >
      <img
        v-if="hasPhoto"
        :src="modelValue"
        alt="선택한 카페 사진 미리보기"
        class="h-full w-full object-cover"
      />

      <button
        v-else
        type="button"
        class="flex h-full w-full flex-col items-center justify-center gap-2 transition-colors duration-150 ease-soft hover:bg-sand-200"
        :disabled="isProcessing"
        @click="pickInput?.click()"
      >
        <IconPhotoPlus :size="26" :stroke-width="1.4" class="text-ink-soft" />
        <span class="text-label text-ink">
          {{ isProcessing ? "사진 넣는 중" : "사진 추가" }}
        </span>
        <span class="text-caption text-ink-faint">
          카페를 떠올릴 수 있는 사진 한 장
        </span>
      </button>

      <button
        v-if="hasPhoto"
        type="button"
        class="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-pill bg-ink/55 text-sand-50 transition-colors duration-150 ease-soft hover:bg-ink/75"
        aria-label="사진 지우기"
        @click="emit('update:modelValue', '')"
      >
        <IconX :size="18" :stroke-width="1.7" />
      </button>
    </div>

    <div class="mt-3 flex gap-2">
      <UiButton
        variant="outline"
        size="sm"
        :disabled="isProcessing"
        @click="pickInput?.click()"
      >
        {{ hasPhoto ? "사진 바꾸기" : "사진 고르기" }}
      </UiButton>

      <!-- 모바일에서 바로 촬영 -->
      <UiButton
        variant="ghost"
        size="sm"
        class="sm:hidden"
        :disabled="isProcessing"
        @click="cameraInput?.click()"
      >
        <IconCamera :size="16" :stroke-width="1.6" />
        촬영
      </UiButton>
    </div>

    <input
      ref="pickInput"
      type="file"
      accept="image/*"
      class="sr-only"
      tabindex="-1"
      aria-hidden="true"
      @change="onFileChange"
    />
    <input
      ref="cameraInput"
      type="file"
      accept="image/*"
      capture="environment"
      class="sr-only"
      tabindex="-1"
      aria-hidden="true"
      @change="onFileChange"
    />
  </div>
</template>
