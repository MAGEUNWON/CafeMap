// https://nuxt.com/docs/api/configuration/nuxt-config

/**
 * 링크 미리보기(og:image, og:url)는 절대 주소여야 크롤러가 읽는다.
 * 상대 경로로 두면 카톡·슬랙이 이미지를 못 찾는다.
 *
 * 도메인을 바꾸면 이 줄을 고치고 다시 배포해야 한다 — 빌드 때 HTML 에 박힌다.
 * 환경변수로 빼지 않은 이유는 nuxt.config 에서 process 를 쓰려면
 * @types/node 를 들여야 하는데, 줄 하나 때문에 의존성을 늘릴 일은 아니라서다.
 */
const SITE_URL = "https://cafe-map-neon.vercel.app";

const TITLE = "Cafe Pin — 내가 다녀온 카페 기억하기";
const DESCRIPTION = "이름, 위치, 사진, 분위기까지 한곳에 남겨두기";

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
      title: TITLE,
      meta: [
        { charset: "utf-8" },
        {
          name: "viewport",
          content:
            "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=5",
        },
        { name: "description", content: DESCRIPTION },
        { name: "theme-color", content: "#FAF7F1" },

        /*
          링크를 보냈을 때 뜨는 미리보기(카톡·아이메시지·슬랙 등).
          SPA 라 크롤러가 JS 를 안 돌리지만, 여기 적은 값은 빌드 때 HTML 에
          박혀 나가므로 그대로 읽힌다. 다만 페이지별 og 는 못 넣는다.
        */
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Cafe Pin" },
        { property: "og:locale", content: "ko_KR" },
        { property: "og:title", content: TITLE },
        { property: "og:description", content: DESCRIPTION },
        { property: "og:url", content: `${SITE_URL}/` },
        { property: "og:image", content: `${SITE_URL}/og.png` },
        // 크기를 알려주면 크롤러가 이미지를 받기 전에 자리를 잡아 깜빡임이 없다
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image:alt", content: "Cafe Pin 지도에 기록된 카페들" },

        // 트위터는 og 를 일부만 읽어 별도로 적어준다
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: TITLE },
        { name: "twitter:description", content: DESCRIPTION },
        { name: "twitter:image", content: `${SITE_URL}/og.png` },
        { name: "format-detection", content: "telephone=no" },

        // 홈 화면에 추가했을 때 사파리 UI 없이 앱처럼 뜨게 한다.
        // 서비스 워커는 필요 없다 — 매니페스트와 아이콘이면 된다.
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "mobile-web-app-capable", content: "yes" },
        // 없으면 홈 화면 라벨이 title 전체("Cafe Pin — 내가 …")로 잘려 나온다
        { name: "apple-mobile-web-app-title", content: "Cafe Pin" },
        // black-translucent 로 두면 콘텐츠가 상태바 밑으로 들어가
        // sticky top-0 헤더가 잘린다
        {
          name: "apple-mobile-web-app-status-bar-style",
          content: "default",
        },
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        {
          rel: "icon",
          type: "image/png",
          sizes: "192x192",
          href: "/icon-192.png",
        },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
        },
        { rel: "manifest", href: "/manifest.webmanifest" },
        // 카톡 등이 어느 주소를 대표로 볼지 헷갈리지 않게
        { rel: "canonical", href: `${SITE_URL}/` },
      ],
    },
  },
});
