<script setup lang="ts">
import { getJsonLd } from "~/lib/seo/json-ld";
import { getSeoMeta, getMetaHead } from "~/lib/seo/metadata";

const siteConfig = useSiteConfig();
const siteUrl = siteConfig.url || "https://fewwords.app";

useSeoMeta(getSeoMeta(siteUrl));

useHead({
  ...getMetaHead(siteUrl),
  link: [
    ...(getMetaHead(siteUrl).link || []),
    { rel: "alternate", type: "text/plain", href: `${siteUrl}/llms.txt`, title: "LLM-readable content" }
  ],
  script: [
    ...getJsonLd(siteUrl).map((schema) => ({
      type: "application/ld+json",
      innerHTML: JSON.stringify(schema),
    })),
  ],
});
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
    <NuxtLoadingIndicator color="#a67c52" :height="8" />
  </NuxtLayout>
</template>
