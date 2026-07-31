<script setup lang="ts">
import { IconSettings } from "@tabler/icons-vue";

const route = useRoute();

const menu = [
  { to: "/", label: "내 카페 지도" },
  { to: "/cafes", label: "다녀온 카페" },
];

function isActive(to: string): boolean {
  if (to === "/") return route.path === "/";
  return route.path.startsWith(to);
}
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b border-line bg-sand-50/90 backdrop-blur"
  >
    <div class="container-content flex h-16 items-center justify-between gap-6">
      <NuxtLink
        to="/"
        class="text-title-3 tracking-tight text-ink"
        aria-label="Cafe Pin 홈"
      >
        Cafe Pin
      </NuxtLink>

      <nav class="hidden sm:block" aria-label="주요 메뉴">
        <ul class="flex items-center gap-1">
          <li v-for="item in menu" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="inline-flex h-10 items-center rounded-pill px-4 text-label transition-colors duration-150 ease-soft"
              :class="
                isActive(item.to)
                  ? 'text-ink'
                  : 'text-ink-soft hover:bg-sand-100 hover:text-ink'
              "
              :aria-current="isActive(item.to) ? 'page' : undefined"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="flex items-center gap-1">
        <!-- 모바일 이동은 하단 내비가 담당, 설정만 헤더에 둔다 -->
        <NuxtLink
          to="/settings"
          class="flex h-10 w-10 items-center justify-center rounded-pill transition-colors duration-150 ease-soft hover:bg-sand-100"
          :class="isActive('/settings') ? 'text-ink' : 'text-ink-soft'"
          :aria-current="isActive('/settings') ? 'page' : undefined"
          aria-label="설정"
        >
          <IconSettings :size="19" :stroke-width="1.6" />
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
