<script setup lang="ts">
const { tabCount } = useTabCount();

useHead({
  title: computed(
    () => `You Have ${tabCount.value} Unread Tabs. I Know, I Had 87 Too.`,
  ),
  titleTemplate: null,
});
</script>

<template>
  <main class="flex-1">
    <HomeHeroSection />
    <HomeDemoCompare />
    <HomeMetricsStrip />
    <HomeProblemAgitation />
    <HomeWorkflowSection />
    <!-- <HomeSolutionSection /> -->
    <HomeUspSection />
    <HomeFeaturesSection />
    <HomeBookmarkletSection />
    <HomeFinalCta />
  </main>
</template>
