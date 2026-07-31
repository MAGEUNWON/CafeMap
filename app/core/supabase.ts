import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase 클라이언트 로더.
 *
 * kakaoSdk 처럼 모듈 레벨에서 하나만 만든다. 세션은 supabase-js 기본값대로
 * localStorage 에 보관되므로 기기당 최초 1번만 로그인하면 된다.
 */

/**
 * 백엔드 전환 스위치.
 *
 * true 로 켜면: 저장소가 Supabase 로 바뀌고(stores/cafe.ts), 로그인이
 * 강제된다(middleware/auth.global.ts). 켜기 전에 Supabase 프로젝트 생성과
 * supabase/schema.sql 실행, .env 의 URL·anon key 가 준비돼 있어야 한다.
 */
export const BACKEND_ENABLED = true;

export class SupabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseConfigError";
  }
}

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const { supabaseUrl, supabaseAnonKey } = useRuntimeConfig().public;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new SupabaseConfigError(
      "Supabase 키가 설정되지 않음. .env 의 NUXT_PUBLIC_SUPABASE_URL 과 NUXT_PUBLIC_SUPABASE_ANON_KEY 를 확인",
    );
  }

  client = createClient(supabaseUrl, supabaseAnonKey);
  return client;
}
