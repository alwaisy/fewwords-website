<script setup lang="ts">
const siteUrl = useSiteConfig().url;

useHead({
  link: [{ rel: "canonical", href: `${siteUrl}/` }],
});

useSeoMeta({
  title: "Fewwords: Get Key Points in 60 Seconds",
  titleTemplate: null,
  description:
    "Paste a URL. Get the main points in under a minute. Articles, YouTube, Reddit. No signup needed.",
  ogTitle: "Fewwords: Get Key Points in 60 Seconds",
  ogDescription:
    "Paste a URL. Get the main points in under a minute. Articles, YouTube, Reddit. No signup needed.",
  twitterTitle: "Fewwords: Get Key Points in 60 Seconds",
  twitterDescription:
    "Paste a URL. Get the main points in under a minute. Articles, YouTube, Reddit. No signup needed.",
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
    <HomeFaqSection />
    <HomeFinalCta />
  </main>
</template>
