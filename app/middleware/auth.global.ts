import { BACKEND_ENABLED } from "~/core/supabase";
import { useAuthStore } from "~/stores/auth";

/**
 * 로그인 강제. BACKEND_ENABLED 가 꺼져 있으면 아무것도 하지 않는다 —
 * localStorage 모드에서는 로그인이 필요 없다.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (!BACKEND_ENABLED) return;
  if (import.meta.server) return;

  const auth = useAuthStore();
  await auth.ensureReady();

  if (!auth.user && to.path !== "/login") return navigateTo("/login");
  if (auth.user && to.path === "/login") return navigateTo("/");
});
