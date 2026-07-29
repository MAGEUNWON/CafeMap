<script setup lang="ts">
definePageMeta({ layout: "default" });
useHead({ title: "CafeMap — 내가 다녀온 카페 기억하기" });
</script>

<template>
  <div>
    <LandingHero />
    <LandingFeatures />
    <LandingRecent />
    <LandingCta />
  </div>
</template>
