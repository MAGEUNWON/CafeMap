/**
 * Supabase 무료 티어는 7일간 요청이 없으면 프로젝트를 일시정지한다.
 * Vercel cron(vercel.json)이 하루 한 번 이 라우트를 불러 가벼운 쿼리를 날린다.
 * 익명 키 + RLS 라 데이터는 안 나오고, 요청이 갔다는 사실만 남는다.
 */
export default defineEventHandler(async () => {
  const { supabaseUrl, supabaseAnonKey } = useRuntimeConfig().public;
  if (!supabaseUrl || !supabaseAnonKey)
    return { ok: false, reason: "no-config" };

  const res = await fetch(`${supabaseUrl}/rest/v1/cafes?select=id&limit=1`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });
  return { ok: res.ok };
});
