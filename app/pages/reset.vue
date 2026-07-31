<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
import { useToastStore } from "~/stores/toast";

/**
 * 재설정 메일의 링크가 도착하는 곳.
 * 링크에 실린 토큰으로 Supabase 가 임시 세션을 만들어주므로,
 * 여기서는 새 비밀번호만 받으면 된다. 세션 없이 직접 들어오면
 * 미들웨어가 /login 으로 돌려보낸다.
 */
definePageMeta({ layout: "form" });
useHead({ title: "비밀번호 재설정 — Cafe Pin" });

const auth = useAuthStore();
const toast = useToastStore();

const password = ref("");
const submitting = ref(false);

async function onSubmit() {
  if (submitting.value) return;
  if (password.value.length < 6) {
    toast.error("비밀번호는 6자 이상이어야 함");
    return;
  }
  submitting.value = true;
  try {
    await auth.updatePassword(password.value);
    toast.success("비밀번호를 바꿨음");
    await navigateTo("/");
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "바꾸지 못함");
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="container-content flex flex-1 items-center justify-center py-10">
    <div class="w-full max-w-[380px]">
      <h1 class="text-title-1 text-ink">새 비밀번호 정하기</h1>
      <p class="mt-1.5 text-body-2 text-ink-soft">
        {{ auth.user?.email }} 계정의 비밀번호를 새로 정함
      </p>

      <form class="mt-6 flex flex-col gap-4" @submit.prevent="onSubmit">
        <UiTextField
          v-model="password"
          label="새 비밀번호"
          type="password"
          hint="6자 이상"
          required
        />
        <UiButton type="submit" block :disabled="submitting" class="mt-2">
          비밀번호 바꾸기
        </UiButton>
      </form>
    </div>
  </div>
</template>
