<template>
  <div class="flex min-h-[100dvh] flex-col bg-sand-50">
    <LayoutAppHeader />

    <!-- 하단 내비 높이만큼 모바일에서 여백 확보 -->
    <main class="flex min-h-0 flex-1 flex-col pb-16 sm:pb-0">
      <slot />
    </main>

    <LayoutMobileBottomNavigation />
    <UiToaster />
  </div>
</template>
