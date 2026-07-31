import { BACKEND_ENABLED } from "~/core/supabase";
import { useAuthStore } from "~/stores/auth";
import { useCafeStore } from "~/stores/cafe";

/**
 * 저장소는 하이드레이션이 끝난 뒤에 읽는다.
 * 백엔드 모드에서는 세션 복원까지 기다렸다가, 로그인돼 있을 때만 읽는다 —
 * 미로그인이면 미들웨어가 /login 으로 보내고, 로그인 성공 시점에 login.vue 가 채운다.
 */
export default defineNuxtPlugin(() => {
  onNuxtReady(async () => {
    if (BACKEND_ENABLED) {
      const auth = useAuthStore();
      await auth.ensureReady();
      if (!auth.user) return;
    }
    void useCafeStore().hydrate();
  });
});
