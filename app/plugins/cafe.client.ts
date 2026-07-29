import { useCafeStore } from "~/stores/cafe";

/**
 * localStorage 는 브라우저에만 있으므로 하이드레이션이 끝난 뒤에 읽는다.
 * 하이드레이션 도중에 records 를 채우면 서버가 그린 스켈레톤과 트리가 어긋난다.
 */
export default defineNuxtPlugin(() => {
  onNuxtReady(() => {
    void useCafeStore().hydrate();
  });
});
