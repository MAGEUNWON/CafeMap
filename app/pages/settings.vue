<script setup lang="ts">
import { IconAlertTriangle, IconDownload, IconUpload } from "@tabler/icons-vue";
import {
  formatBytes,
  readBackupFile,
  saveBackupFile,
} from "~/core/backup/file";
import { BackupParseError, parseBackup } from "~/core/backup/schema";
import { useCafeStore } from "~/stores/cafe";
import { useToastStore } from "~/stores/toast";
import type { CafeRecord } from "~/types/cafe";

definePageMeta({ layout: "default" });
useHead({ title: "설정 — CafeMap" });

const store = useCafeStore();
const toast = useToastStore();

/** 사진까지 넣으면 5MB 근처에서 저장이 막힌다. 그 전에 알려준다. */
const WARN_BYTES = 4 * 1024 * 1024;

const used = ref<number | null>(null);
const exporting = ref(false);
const importing = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

/** 내보내기가 막힌 환경 — 본문을 그대로 띄워 복사하게 한다 */
const fallbackJson = ref("");

/** 확인 모달을 기다리는 가져오기 후보 */
interface Pending {
  records: CafeRecord[];
  dropped: number;
}
const pending = ref<Pending | null>(null);

const usedLabel = computed(() =>
  used.value === null ? "" : formatBytes(used.value),
);
const isTight = computed(() => used.value !== null && used.value >= WARN_BYTES);

async function refreshUsage() {
  used.value = await store.usedBytes();
}

onMounted(refreshUsage);
watch(() => store.records.length, refreshUsage);

async function onExport() {
  exporting.value = true;
  fallbackJson.value = "";
  try {
    const backup = await store.exportBackup();
    const result = await saveBackupFile(backup);
    if (result === "unsupported") {
      fallbackJson.value = JSON.stringify(backup, null, 2);
      toast.error("파일로 저장할 수 없는 환경이라 본문을 띄웠음");
      return;
    }
    toast.success(
      result === "shared" ? "백업 파일 공유함" : "백업 파일 내려받음",
    );
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "내보내지 못함");
  } finally {
    exporting.value = false;
  }
}

async function onPickFile(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  // 같은 파일을 다시 골라도 change 가 나도록 비운다
  input.value = "";
  if (!file) return;

  try {
    const text = await readBackupFile(file);
    const { backup, dropped } = parseBackup(text);
    if (backup.records.length === 0) {
      toast.error("가져올 기록이 없음");
      return;
    }
    pending.value = { records: backup.records, dropped };
  } catch (err) {
    toast.error(
      err instanceof BackupParseError || err instanceof Error
        ? err.message
        : "파일을 읽지 못함",
    );
  }
}

const confirmDescription = computed(() => {
  const target = pending.value;
  if (!target) return "";
  const skipped =
    target.dropped > 0 ? ` 형식이 맞지 않는 ${target.dropped}건은 건너뜀.` : "";
  return (
    `지금 기록 ${store.records.length}곳을 파일의 ${target.records.length}곳으로 바꾼다.` +
    `${skipped} 되돌릴 수 없으니 먼저 지금 기록을 내보내둔다.`
  );
});

async function onConfirmImport() {
  const target = pending.value;
  if (!target) return;

  importing.value = true;
  try {
    // 복원이 새로운 손실이 되면 안 된다 — 덮어쓰기 전에 지금 것을 먼저 빼둔다
    if (store.records.length > 0) {
      await saveBackupFile(await store.exportBackup());
    }
    await store.importBackup(target.records);
    await refreshUsage();
    toast.success(
      target.dropped > 0
        ? `${target.records.length}곳을 가져옴 (${target.dropped}건 건너뜀)`
        : `${target.records.length}곳을 가져옴`,
    );
    pending.value = null;
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "가져오지 못했음");
  } finally {
    importing.value = false;
  }
}
</script>

<template>
  <div class="container-content max-w-form pb-16 pt-7">
    <h1 class="text-title-1 text-ink">설정</h1>

    <!-- 사용량 -->
    <section class="surface mt-6 p-5">
      <h2 class="text-title-3 text-ink">저장된 기록</h2>
      <p class="mt-1.5 text-body-2 text-ink-soft">
        카페 {{ store.records.length }}곳
        <template v-if="usedLabel"> · 약 {{ usedLabel }} 사용 </template>
      </p>

      <p
        v-if="isTight"
        class="mt-3 flex items-start gap-2 rounded-field bg-clay/10 p-3 text-caption text-ink"
      >
        <IconAlertTriangle
          :size="16"
          :stroke-width="1.7"
          class="mt-0.5 shrink-0 text-clay"
        />
        저장 공간이 거의 찼음. 사진이 큰 기록을 정리하거나 백업 후 지워야 함
      </p>
    </section>

    <!-- 백업 -->
    <section class="surface mt-4 p-5">
      <h2 class="text-title-3 text-ink">기록 백업</h2>
      <p class="mt-1.5 text-body-2 text-ink-soft">
        기록은 이 브라우저 안에만 있음. 브라우저 데이터를 지우면 함께 사라지고,
        아이폰은 오래 안 쓰면 스스로 지우기도 함. 가끔 파일로 빼두는 게 안전함
      </p>

      <div class="mt-5 flex flex-col gap-2 sm:flex-row">
        <UiButton
          variant="outline"
          block
          :disabled="exporting || store.records.length === 0"
          @click="onExport"
        >
          <IconDownload :size="17" :stroke-width="1.7" />
          기록 내보내기
        </UiButton>

        <UiButton
          variant="outline"
          block
          :disabled="importing"
          @click="fileInput?.click()"
        >
          <IconUpload :size="17" :stroke-width="1.7" />
          기록 가져오기
        </UiButton>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept="application/json,.json"
        class="sr-only"
        aria-label="백업 파일 고르기"
        @change="onPickFile"
      />

      <!-- 다운로드도 공유도 안 되는 환경의 최후 수단 -->
      <div v-if="fallbackJson" class="mt-5">
        <label
          for="backup-fallback"
          class="mb-2 block text-label text-ink-soft"
        >
          아래 내용을 복사해 파일로 저장
        </label>
        <textarea
          id="backup-fallback"
          :value="fallbackJson"
          readonly
          rows="8"
          class="w-full rounded-field border border-line bg-paper p-3 text-caption text-ink"
        />
      </div>
    </section>

    <UiConfirmDialog
      :open="pending !== null"
      title="기록을 바꿀까?"
      :description="confirmDescription"
      confirm-label="바꾸기"
      @close="pending = null"
      @confirm="onConfirmImport"
    />
  </div>
</template>
