<script setup lang="ts">
import refundCopy from "~/content/refund-copy";
import { sanitizeMarkdown } from "~/lib/markdown";

const siteUrl = useSiteConfig().url;

useHead({
  link: [{ rel: "canonical", href: `${siteUrl}/refund` }],
});

useSeoMeta({
  title: refundCopy.seo.title,
  description: refundCopy.seo.description,
  ogTitle: refundCopy.seo.title,
  ogDescription: refundCopy.seo.description,
  twitterTitle: refundCopy.seo.title,
  twitterDescription: refundCopy.seo.description,
});

const content = sanitizeMarkdown(refundCopy.content);
</script>

<template>
  <main class="flex-1 py-16 px-4">
    <div class="max-w-3xl mx-auto prose prose-muted dark:prose-invert" v-html="content" />
  </main>
</template>
