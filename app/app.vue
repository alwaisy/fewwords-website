<script setup lang="ts">
import { jsonLd } from "~/lib/seo/json-ld";
import { seoMeta, metaHead } from "~/lib/seo/metadata";

useSeoMeta(seoMeta);
useHead({
  ...metaHead,
  script: jsonLd.map((schema) => ({
    type: "application/ld+json",
    innerHTML: JSON.stringify(schema),
  })),
});
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
    <NuxtLoadingIndicator color="#a67c52" :height="8" />
  </NuxtLayout>
</template>
