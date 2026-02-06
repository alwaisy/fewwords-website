<script setup lang="ts">
const { tabCount } = useTabCount()

useHead({
  title: computed(() => `You Have ${tabCount.value} Unread Tabs. We Both Know It.`),
  titleTemplate: null,
});
</script>

<template>
  <!-- SLAY model for content copy -->
  <main class="flex-1">
    <HomeHeroSection />
    <HomeProblemAgitation />
    <HomeSolutionSection />
    <HomeFeaturesSection />
    <HomeFinalCta />
  </main>
</template>
