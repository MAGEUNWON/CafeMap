/**
 * 같은 포트에서 돌던 다른 프로젝트의 서비스 워커가 남아 있으면
 * 캐시된 옛 화면을 그대로 보여준다. 이 앱은 PWA 가 아니므로 전부 지운다.
 *
 * 개발 환경에서만 돈다. 배포 도메인은 오리진이 우리 것뿐이라 남의 워커가
 * 있을 수 없고, 프로덕션에서 reload() 를 부를 수 있는 코드는 그 자체로 위험하다.
 *
 * ⚠️ 나중에 오프라인 지원(PWA)을 붙이려면 이 플러그인을 먼저 지워야 한다.
 * 안 그러면 등록 → 해제 → 리로드 → 재등록 무한 루프가 된다.
 * 홈 화면에 추가하는 것 자체는 서비스 워커가 필요 없으므로 매니페스트·아이콘과는
 * 충돌하지 않는다.
 */
export default defineNuxtPlugin(() => {
  if (!import.meta.dev) return;
  if (!("serviceWorker" in navigator)) return;

  void navigator.serviceWorker
    .getRegistrations()
    .then(async (registrations) => {
      if (registrations.length === 0) return;

      await Promise.all(registrations.map((r) => r.unregister()));

      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }

      // 워커가 가로채던 응답을 버리고 새로 받는다
      window.location.reload();
    })
    .catch(() => {
      // 정리에 실패해도 앱 동작을 막지 않는다
    });
});
