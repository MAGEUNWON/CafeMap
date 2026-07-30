<template>
  <!-- 등록·수정 화면은 하단 저장 바가 있으므로 하단 내비를 띄우지 않는다 -->
  <div class="flex min-h-[100dvh] flex-col bg-sand-50">
    <LayoutAppHeader />
    <LayoutStorageAlert />
    <main class="flex min-h-0 flex-1 flex-col">
      <slot />
    </main>
    <UiToaster />
  </div>
</template>
