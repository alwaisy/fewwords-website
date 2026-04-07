<script setup lang="ts">
const siteUrl = useSiteConfig().url;

useHead({
  link: [{ rel: "canonical", href: `${siteUrl}/app` }],
});

useSeoMeta({
  title: "Clear Your Tabs - Fewwords",
  titleTemplate: null,
  description:
    "Paste a URL to get the key insights in seconds. Works with articles, YouTube videos, and Reddit threads.",
  ogTitle: "Clear Your Tabs - Fewwords",
  ogDescription:
    "Paste a URL to get the key insights in seconds. Works with articles, YouTube videos, and Reddit threads.",
  twitterTitle: "Clear Your Tabs - Fewwords",
  twitterDescription:
    "Paste a URL to get the key insights in seconds. Works with articles, YouTube videos, and Reddit threads.",
});

const { canProceed, refresh: refreshQuota } = useQuota()

// After a summary is created, refresh quota
const handleSubmitted = () => {
  refreshQuota()
}
</script>

<template>
  <main class="flex-1 flex items-center justify-center px-4 min-h-[calc(100vh-186px)]">
    <div class="w-full max-w-2xl">
      <AppQuotaGate v-if="!canProceed" />
      <AppInput v-else @submitted="handleSubmitted" />
    </div>
  </main>
</template>
