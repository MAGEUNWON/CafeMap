import type { User } from "@supabase/supabase-js";
import { defineStore } from "pinia";
import { getSupabase } from "~/core/supabase";

/**
 * 로그인 상태.
 *
 * 세션 복원(getSession)이 끝나기 전에는 user 가 null 이어도
 * "로그아웃"이라고 단정할 수 없다 — isReady 로 구분한다.
 */

interface AuthState {
  user: User | null;
  isReady: boolean;
}

let initPromise: Promise<void> | null = null;

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    isReady: false,
  }),

  actions: {
    /** 세션 복원 + 상태 구독. 몇 번을 불러도 초기화는 한 번만 된다 */
    async ensureReady(): Promise<void> {
      initPromise ??= (async () => {
        const supabase = getSupabase();
        const { data } = await supabase.auth.getSession();
        this.user = data.session?.user ?? null;
        supabase.auth.onAuthStateChange((_event, session) => {
          this.user = session?.user ?? null;
        });
        this.isReady = true;
      })();
      return initPromise;
    },

    async signIn(email: string, password: string): Promise<void> {
      const { error } = await getSupabase().auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error(loginErrorMessage(error.message));
    },

    /** @returns 가입과 동시에 로그인됐는지 (확인 메일이 꺼져 있으면 true) */
    async signUp(email: string, password: string): Promise<boolean> {
      const { data, error } = await getSupabase().auth.signUp({
        email,
        password,
      });
      if (error) throw new Error(loginErrorMessage(error.message));
      return data.session !== null;
    },

    async signOut(): Promise<void> {
      const { error } = await getSupabase().auth.signOut();
      if (error) throw new Error("로그아웃하지 못함");
    },
  },
});

/** Supabase 영문 오류를 사람이 읽을 문구로 */
function loginErrorMessage(raw: string): string {
  const message = raw.toLowerCase();
  if (message.includes("invalid login credentials")) {
    return "이메일 또는 비밀번호가 맞지 않음";
  }
  if (message.includes("already registered")) {
    return "이미 가입된 이메일임";
  }
  if (message.includes("password should be at least")) {
    return "비밀번호는 6자 이상이어야 함";
  }
  if (message.includes("email not confirmed")) {
    return "메일함의 확인 링크를 먼저 눌러야 함";
  }
  if (message.includes("rate limit")) {
    return "잠시 뒤에 다시 시도";
  }
  return "로그인에 실패함";
}
