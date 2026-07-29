/**
 * 같은 포트에서 돌던 다른 프로젝트의 서비스 워커가 남아 있으면
 * 캐시된 옛 화면을 그대로 보여준다. 이 앱은 PWA 가 아니므로 전부 지운다.
 */
export default defineNuxtPlugin(() => {
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
