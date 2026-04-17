<script setup lang="ts">
const siteUrl = useSiteConfig().url;

useHead({
  link: [{ rel: "canonical", href: `${siteUrl}/` }],
});

useSeoMeta({
  title: "Fewwords: Summarize Anything in 60 Seconds",
  titleTemplate: null,
  description:
    "Articles, YouTube, Reddit. Paste a URL, get the key points. Actually useful summaries. No signup needed.",
  ogTitle: "Fewwords: Summarize Anything in 60 Seconds",
  ogDescription:
    "Articles, YouTube, Reddit. Paste a URL, get the key points. Actually useful summaries. No signup needed.",
  twitterTitle: "Fewwords: Summarize Anything in 60 Seconds",
  twitterDescription:
    "Articles, YouTube, Reddit. Paste a URL, get the key points. Actually useful summaries. No signup needed.",
});

const config = useRuntimeConfig();
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
    <HomePricingSection v-if="config.public.paddleApproved" />
    <HomeBookmarkletSection />
    <HomeFaqSection />
    <HomeFinalCta />
  </main>
</template>
