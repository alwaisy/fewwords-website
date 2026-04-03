<script setup lang="ts">
useSeoMeta({
  title: "Fewwords: Instant Insight from Any URL",
  titleTemplate: "%s - Fewwords",
  description:
    "Get the key points from any article, video, or Reddit thread in seconds. Simple, structured, and actionable summaries.",
  ogType: "website",
  ogSiteName: "Fewwords",
  ogTitle: "Fewwords: Instant Insight from Any URL",
  ogDescription:
    "Paste a URL. Get the main points in seconds. Articles, YouTube, Reddit. No signup needed.",
  ogImage: "/og-image.png",
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterCard: "summary_large_image",
  twitterTitle: "Fewwords: Instant Insight from Any URL",
  twitterDescription:
    "Paste a URL. Get the main points in seconds. Articles, YouTube, Reddit. No signup needed.",
  twitterImage: "/og-image.png",
  twitterImageWidth: 1200,
  twitterImageHeight: 630,
});

useHead({
  htmlAttrs: { lang: "en" },
  link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
  meta: [
    { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=5" },
    { name: "theme-color", content: "#fafaf9" }
  ]
});

useSchemaOrg([
  defineWebSite({
    name: "Fewwords",
    url: "https://fewwords.app",
    alternateName: "Fewwords",
  }),
  defineOrganization({
    name: "Fewwords",
    url: "https://fewwords.app",
    logo: "/og-image.png",
    description: "Instant content summarization for articles, videos, and Reddit threads. Get the main points in seconds.",
  }),
  defineWebPage(),
]);
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
    <NuxtLoadingIndicator color="#a67c52" :height="8" />
  </NuxtLayout>
</template>
