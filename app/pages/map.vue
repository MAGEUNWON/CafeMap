<script setup lang="ts">
// 지도가 홈이 되면서 /map 은 / 로 흡수됨 — 홈 화면 바로가기 등 옛 링크 호환용
await navigateTo("/", { replace: true });
</script>

<template>
  <div />
</template>
