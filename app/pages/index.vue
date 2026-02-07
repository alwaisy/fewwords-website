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
    <HomeMetricsStrip />
    <HomeDemoComparison />
    <HomeProblemAgitation />
    <HomeSolutionSection />
    <HomeUspSection />
    <HomeFeaturesSection />
    <HomeFinalCta />
  </main>
</template>
