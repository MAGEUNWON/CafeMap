<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import { useCafeStore } from "~/stores/cafe";
import { useToastStore } from "~/stores/toast";

definePageMeta({ layout: "form" });
useHead({ title: "로그인 — Cafe Pin" });

const auth = useAuthStore();
const toast = useToastStore();

const mode = ref<"signIn" | "signUp">("signIn");
const email = ref("");
const password = ref("");
const submitting = ref(false);
const sendingReset = ref(false);

/** 가입 직후 — 확인 메일 안내를 지속적으로 보여준다 */
const signedUp = ref(false);

const title = computed(() =>
  mode.value === "signIn" ? "로그인" : "계정 만들기",
);

function switchMode() {
  mode.value = mode.value === "signIn" ? "signUp" : "signIn";
  signedUp.value = false;
}

async function onSubmit() {
  if (submitting.value) return;
  if (!email.value.trim() || !password.value) {
    toast.error("이메일과 비밀번호를 입력해야 함");
    return;
  }

  submitting.value = true;
  try {
    if (mode.value === "signUp") {
      const signedIn = await auth.signUp(email.value.trim(), password.value);
      if (!signedIn) {
        // 확인 메일이 켜진 프로젝트 — 링크를 누른 뒤 로그인해야 한다
        signedUp.value = true;
        mode.value = "signIn";
        return;
      }
    } else {
      await auth.signIn(email.value.trim(), password.value);
    }

    // 미들웨어가 로그인 전에는 hydrate 를 막았으므로 여기서 채운다
    void useCafeStore().hydrate();
    await navigateTo("/");
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "실패함");
  } finally {
    submitting.value = false;
  }
}

async function onForgotPassword() {
  if (sendingReset.value) return;
  if (!email.value.trim()) {
    toast.error("이메일을 먼저 입력하면 재설정 링크를 보내줌");
    return;
  }
  sendingReset.value = true;
  try {
    await auth.resetPassword(email.value.trim());
    toast.success("재설정 메일을 보냈음. 메일함(스팸함 포함) 확인");
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "메일을 보내지 못함");
  } finally {
    sendingReset.value = false;
  }
}
</script>

<template>
  <div class="container-content flex flex-1 items-center justify-center py-10">
    <div class="w-full max-w-[380px]">
      <h1 class="text-title-1 text-ink">{{ title }}</h1>
      <p class="mt-1.5 text-body-2 text-ink-soft">
        어느 기기에서든 같은 기록을 보려면 로그인이 필요함
      </p>

      <p
        v-if="signedUp"
        class="mt-4 rounded-field bg-moss-pale p-3 text-body-2 text-ink"
      >
        확인 메일을 보냈음. 메일함에서 링크를 누른 뒤 로그인하면 됨
      </p>

      <form class="mt-6 flex flex-col gap-4" @submit.prevent="onSubmit">
        <UiTextField
          v-model="email"
          label="이메일"
          type="email"
          placeholder="you@example.com"
          required
        />
        <UiTextField
          v-model="password"
          label="비밀번호"
          type="password"
          :hint="mode === 'signUp' ? '6자 이상' : ''"
          required
        />

        <UiButton type="submit" block :disabled="submitting" class="mt-2">
          {{ title }}
        </UiButton>
      </form>

      <div class="mt-5 flex flex-col items-start gap-2.5">
        <button
          type="button"
          class="text-label text-ink-soft underline-offset-4 transition-colors duration-150 ease-soft hover:text-ink hover:underline"
          @click="switchMode"
        >
          {{
            mode === "signIn"
              ? "처음이면 계정 만들기"
              : "이미 계정이 있으면 로그인"
          }}
        </button>

        <button
          v-if="mode === 'signIn'"
          type="button"
          class="text-label text-ink-faint underline-offset-4 transition-colors duration-150 ease-soft hover:text-ink hover:underline"
          :disabled="sendingReset"
          @click="onForgotPassword"
        >
          비밀번호를 잊었어요
        </button>
      </div>
    </div>
  </div>
</template>
