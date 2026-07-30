// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-01-01",
  // Nuxt 4 디렉토리 구조(app/) 사용 — 기존 사내 프론트 3종과 동일한 배치
  future: { compatibilityVersion: 4 },

  /*
    서버에서 할 일이 없다. 기록은 전부 브라우저 localStorage 에 있어서
    SSR 은 스켈레톤을 한 번 그렸다 하이드레이션 뒤 다시 그리는 이중 렌더링만 만든다.

    그렇다고 nuxt generate(완전 정적)로 가면 안 된다. nitro 의 vercel-static
    프리셋은 SPA 캐치올 라우트를 넣기 전에 반환해버려서 /cafes/3 직접 접속
    (홈 화면 딥링크·새로고침·공유 링크)이 404 가 된다.
    ssr:false + 기본 vercel 프리셋이면 캐치올이 자동으로 생긴다.
  */
  ssr: false,

  modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt"],

  css: ["~/assets/css/tailwind.css"],

  tailwindcss: {
    cssPath: ["~/assets/css/tailwind.css", { injectPosition: "first" }],
    configPath: "tailwind.config.ts",
    exposeConfig: false,
    viewer: false,
  },

  components: [
    { path: "~/components/ui", prefix: "Ui" },
    { path: "~/components/layout", prefix: "Layout" },
    // 파일명이 이미 역할을 담고 있어 접두사를 붙이지 않는다 (CafeMap, AtmosphereTag ...)
    { path: "~/components/cafe", pathPrefix: false },
    { path: "~/components/landing", pathPrefix: false },
  ],

  imports: { dirs: ["composables"] },

  runtimeConfig: {
    public: {
      // NUXT_PUBLIC_KAKAO_MAP_KEY 로 주입. 카카오 JavaScript 키는 도메인 제한이
      // 걸려 있어 브라우저에 노출되는 게 정상이지만 레포에는 올리지 않는다.
      kakaoMapKey: "",
    },
  },

  typescript: { strict: true, typeCheck: false },

  app: {
    head: {
      htmlAttrs: { lang: "ko" },
      title: "CafeMap — 내가 다녀온 카페 기억하기",
      meta: [
        { charset: "utf-8" },
        {
          name: "viewport",
          content:
            "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=5",
        },
        {
          name: "description",
          content: "이름, 위치, 사진, 분위기까지 한곳에 남겨두기",
        },
        { name: "theme-color", content: "#FAF7F1" },
        { name: "format-detection", content: "telephone=no" },
      ],
    },
  },
});
