<script setup lang="ts">
import contactCopy from "~/content/contact-copy";

const siteUrl = useSiteConfig().url;

useHead({
  link: [{ rel: "canonical", href: `${siteUrl}/contact` }],
});

useSeoMeta({
  title: contactCopy.seo.title,
  description: contactCopy.seo.description,
  ogTitle: contactCopy.seo.title,
  ogDescription: contactCopy.seo.description,
  twitterTitle: contactCopy.seo.title,
  twitterDescription: contactCopy.seo.description,
});
</script>

<template>
  <main class="flex-1 py-16 px-4">
    <div class="max-w-2xl mx-auto text-center">
      <h1 class="text-4xl font-bold mb-6 tracking-tight">{{ contactCopy.hero.headline }}</h1>
      
      <div class="prose prose-muted mx-auto text-lg leading-relaxed text-muted-foreground">
        <p>
          {{ contactCopy.content.intro }}
        </p>
        
        <div class="mt-12 space-y-8 not-prose">
          <div v-for="method in contactCopy.content.methods" :key="method.label" class="flex flex-col items-center">
            <span class="text-sm font-medium text-foreground uppercase tracking-widest mb-2">{{ method.label }}</span>
            <a 
              :href="method.link" 
              class="text-2xl font-semibold text-primary hover:underline transition-colors"
            >
              {{ method.value }}
            </a>
          </div>
        </div>

        <p class="mt-16 text-sm italic">
          {{ contactCopy.content.note }}
        </p>
      </div>

      <div class="mt-12">
        <Button as-child variant="outline">
          <NuxtLink to="/">{{ contactCopy.content.cta }}</NuxtLink>
        </Button>
      </div>
    </div>
  </main>
</template>
