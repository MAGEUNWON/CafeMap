import type { Config } from "tailwindcss";
import { tailwindExtend } from "./app/tokens";

export default {
  content: [
    "./app/components/**/*.{vue,js,ts}",
    "./app/layouts/**/*.vue",
    "./app/pages/**/*.vue",
    "./app/plugins/**/*.{js,ts}",
    "./app/app.vue",
    "./app/error.vue",
  ],
  theme: {
    // 모바일 퍼스트. sm 부터 태블릿, lg 부터 데스크톱 2열 레이아웃.
    screens: {
      sm: "640px",
      md: "834px",
      lg: "1024px",
      xl: "1280px",
    },
    extend: {
      ...tailwindExtend,
      transitionTimingFunction: {
        soft: "cubic-bezier(0.22, 0.61, 0.36, 1)",
      },
    },
  },
  plugins: [],
} satisfies Config;
