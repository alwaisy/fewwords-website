<script setup lang="ts">
import termsCopy from "~/content/terms-copy";
import { sanitizeMarkdown } from "~/lib/markdown";

const siteUrl = useSiteConfig().url;

useHead({
  link: [{ rel: "canonical", href: `${siteUrl}/terms` }],
});

useSeoMeta({
  title: termsCopy.seo.title,
  description: termsCopy.seo.description,
  ogTitle: termsCopy.seo.title,
  ogDescription: termsCopy.seo.description,
  twitterTitle: termsCopy.seo.title,
  twitterDescription: termsCopy.seo.description,
});

const content = sanitizeMarkdown(termsCopy.content);
</script>

<template>
  <main class="flex-1 py-16 px-4">
    <div class="max-w-3xl mx-auto prose prose-muted dark:prose-invert" v-html="content" />
  </main>
</template>
