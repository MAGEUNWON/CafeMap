<script setup lang="ts">
import { IconAlertTriangle, IconDownload, IconUpload } from "@tabler/icons-vue";
import {
  formatBytes,
  readBackupFile,
  saveBackupFile,
} from "~/core/backup/file";
import { BackupParseError, parseBackup } from "~/core/backup/schema";
import { BACKEND_ENABLED } from "~/core/supabase";
import { useAuthStore } from "~/stores/auth";
import { useCafeStore } from "~/stores/cafe";
import { useToastStore } from "~/stores/toast";
import type { CafeRecord } from "~/types/cafe";

definePageMeta({ layout: "default" });
useHead({ title: "설정 — Cafe Pin" });

const store = useCafeStore();
const toast = useToastStore();
const auth = useAuthStore();

const signingOut = ref(false);
const newPassword = ref("");
const changingPassword = ref(false);

async function onChangePassword() {
  if (changingPassword.value) return;
  if (newPassword.value.length < 6) {
    toast.error("비밀번호는 6자 이상이어야 함");
    return;
  }
  changingPassword.value = true;
  try {
    await auth.updatePassword(newPassword.value);
    newPassword.value = "";
    toast.success("비밀번호를 바꿨음");
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "바꾸지 못함");
  } finally {
    changingPassword.value = false;
  }
}

async function onSignOut() {
  if (signingOut.value) return;
  signingOut.value = true;
  try {
    await auth.signOut();
    // 다음 로그인(다른 계정일 수도)을 위해 메모리의 기록을 비운다
    store.$reset();
    await navigateTo("/login");
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "로그아웃하지 못함");
  } finally {
    signingOut.value = false;
  }
}

/** 사진까지 넣으면 5MB 근처에서 저장이 막힌다. 그 전에 알려준다. */
const WARN_BYTES = 4 * 1024 * 1024;

/** 브라우저 localStorage 한도 근사치 — 게이지의 분모로만 쓴다 */
const LIMIT_BYTES = 5 * 1024 * 1024;

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

/** 가져오기 진행 단계 — choose: 병합/교체 선택, replace: 교체 최종 확인 */
const step = ref<"choose" | "replace" | null>(null);

const usedLabel = computed(() =>
  used.value === null ? "" : formatBytes(used.value),
);
const isTight = computed(() => used.value !== null && used.value >= WARN_BYTES);
const usedPercent = computed(() =>
  used.value === null
    ? 0
    : Math.min(100, Math.round((used.value / LIMIT_BYTES) * 100)),
);

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
    // 기존 기록이 없으면 병합=교체라 선택지가 무의미하다
    step.value = store.records.length === 0 ? "replace" : "choose";
  } catch (err) {
    toast.error(
      err instanceof BackupParseError || err instanceof Error
        ? err.message
        : "파일을 읽지 못함",
    );
  }
}

function cancelImport() {
  pending.value = null;
  step.value = null;
}

const chooseTitle = computed(() =>
  pending.value ? `기록 ${pending.value.records.length}곳 가져오기` : "",
);

const chooseDescription = computed(() => {
  const target = pending.value;
  if (!target) return "";
  const skipped =
    target.dropped > 0 ? ` 형식이 맞지 않는 ${target.dropped}건은 제외됨.` : "";
  return (
    `합치면 지금 기록 ${store.records.length}곳은 그대로 두고 파일의 새 카페만 추가된다. ` +
    `같은 카페(이름·방문일·위치가 같음)는 건너뜀.${skipped}`
  );
});

async function onMerge() {
  const target = pending.value;
  if (!target || importing.value) return;

  importing.value = true;
  try {
    const { added, skipped } = await store.mergeBackup(target.records);
    await refreshUsage();
    if (added === 0) {
      toast.success("모두 이미 있는 기록임");
    } else {
      toast.success(
        skipped > 0
          ? `${added}곳 추가함 (중복 ${skipped}건 건너뜀)`
          : `${added}곳 추가함`,
      );
    }
    cancelImport();
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "가져오지 못했음");
  } finally {
    importing.value = false;
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
    cancelImport();
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

      <div
        v-if="used !== null"
        class="mt-3"
        role="progressbar"
        aria-label="저장 공간 사용량"
        :aria-valuemin="0"
        :aria-valuemax="100"
        :aria-valuenow="usedPercent"
      >
        <div class="h-2 w-full overflow-hidden rounded-pill bg-sand-100">
          <div
            class="h-full rounded-pill transition-[width] duration-300 ease-soft"
            :class="isTight ? 'bg-clay' : 'bg-moss'"
            :style="{ width: `${usedPercent}%` }"
          />
        </div>
        <p class="mt-1.5 text-caption text-index text-ink-faint">
          약 5MB 기준 {{ usedPercent }}% 사용
        </p>
      </div>

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

    <!-- 계정 — 백엔드 모드에서만 -->
    <section v-if="BACKEND_ENABLED && auth.user" class="surface mt-4 p-5">
      <h2 class="text-title-3 text-ink">계정</h2>
      <p class="mt-1.5 text-body-2 text-ink-soft">{{ auth.user.email }}</p>

      <form
        class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start"
        @submit.prevent="onChangePassword"
      >
        <div class="flex-1">
          <UiTextField
            v-model="newPassword"
            label="새 비밀번호"
            type="password"
            hint="6자 이상"
            hide-label
            placeholder="새 비밀번호 (6자 이상)"
          />
        </div>
        <UiButton
          type="submit"
          variant="outline"
          :disabled="changingPassword || newPassword.length === 0"
        >
          비밀번호 변경
        </UiButton>
      </form>

      <UiButton
        variant="outline"
        class="mt-4"
        :disabled="signingOut"
        @click="onSignOut"
      >
        로그아웃
      </UiButton>
    </section>

    <!-- 가져오기 방식 선택 — 기존 기록이 있을 때만 거친다 -->
    <UiModal
      :open="step === 'choose' && pending !== null"
      :title="chooseTitle"
      :description="chooseDescription"
      @close="cancelImport"
    >
      <div class="flex flex-col gap-2">
        <UiButton block :disabled="importing" @click="onMerge">
          기존 기록에 합치기
        </UiButton>
        <UiButton variant="danger" block @click="step = 'replace'">
          전부 교체하기
        </UiButton>
        <UiButton variant="outline" block @click="cancelImport">
          취소
        </UiButton>
      </div>
    </UiModal>

    <UiConfirmDialog
      :open="step === 'replace' && pending !== null"
      title="기록을 바꿀까?"
      :description="confirmDescription"
      confirm-label="바꾸기"
      @close="cancelImport"
      @confirm="onConfirmImport"
    />
  </div>
</template>
