<script setup lang="ts">
import { IconHome2, IconMapPin, IconPhoto, IconPlus } from "@tabler/icons-vue";

const route = useRoute();

const items = [
  { to: "/", label: "홈", icon: IconHome2 },
  { to: "/map", label: "지도", icon: IconMapPin },
  { to: "/cafes", label: "기록", icon: IconPhoto },
  { to: "/cafes/new", label: "추가", icon: IconPlus },
];

function isActive(to: string): boolean {
  if (to === "/") return route.path === "/";
  if (to === "/cafes") return route.path === "/cafes";
  return route.path.startsWith(to);
}
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-sand-50/95 backdrop-blur safe-bottom sm:hidden"
    aria-label="하단 메뉴"
  >
    <ul class="flex">
      <li v-for="item in items" :key="item.to" class="flex-1">
        <NuxtLink
          :to="item.to"
          class="flex h-16 flex-col items-center justify-center gap-1 transition-colors duration-150 ease-soft"
          :class="isActive(item.to) ? 'text-ink' : 'text-ink-faint'"
          :aria-current="isActive(item.to) ? 'page' : undefined"
        >
          <component
            :is="item.icon"
            :size="21"
            :stroke-width="isActive(item.to) ? 1.9 : 1.5"
          />
          <span class="text-label-sm">{{ item.label }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
