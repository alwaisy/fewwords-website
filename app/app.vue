<script setup lang="ts">
useHead({
  title: "Fewwords: Close Your Tabs, Keep the Insight",
  titleTemplate: "%s - Fewwords",
  link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
  meta: [
    {
      name: "description",
      content:
        "You have 73 unread tabs. We both know it. Get the insight from any article or video in 60 seconds. Skip the fluff, close the tabs.",
    },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Fewwords" },
    {
      property: "og:title",
      content: "Fewwords: Close Your Tabs, Keep the Insight",
    },
    {
      property: "og:description",
      content:
        "You have 73 unread tabs. We both know it. Get the insight from any article or video in 60 seconds. Skip the fluff, close the tabs.",
    },
  ],
  htmlAttrs: {
    lang: "en",
  },
});
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
    <NuxtLoadingIndicator color="#3a5ba0" :height="8" />
  </NuxtLayout>
</template>
