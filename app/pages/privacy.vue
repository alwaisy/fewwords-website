<script setup lang="ts">
import privacyCopy from "~/content/privacy-copy";
import { sanitizeMarkdown } from "~/lib/markdown";

const siteUrl = useSiteConfig().url;

useHead({
  link: [{ rel: "canonical", href: `${siteUrl}/privacy` }],
});

useSeoMeta({
  title: privacyCopy.seo.title,
  description: privacyCopy.seo.description,
  ogTitle: privacyCopy.seo.title,
  ogDescription: privacyCopy.seo.description,
  twitterTitle: privacyCopy.seo.title,
  twitterDescription: privacyCopy.seo.description,
});

const content = sanitizeMarkdown(privacyCopy.content);
</script>

<template>
  <main class="flex-1 py-16 px-4">
    <div class="max-w-3xl mx-auto prose prose-muted dark:prose-invert" v-html="content" />
  </main>
</template>
