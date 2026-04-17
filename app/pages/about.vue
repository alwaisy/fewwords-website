<script setup lang="ts">
import aboutCopy from "~/content/about-copy";

const siteUrl = useSiteConfig().url;

useHead({
  link: [{ rel: "canonical", href: `${siteUrl}/about` }],
});

useSeoMeta({
  title: aboutCopy.seo.title,
  titleTemplate: null,
  description: aboutCopy.seo.description,
  ogTitle: aboutCopy.seo.title,
  ogDescription: aboutCopy.seo.description,
  twitterTitle: aboutCopy.seo.title,
  twitterDescription: aboutCopy.seo.description,
});
</script>

<template>
  <main class="flex-1 py-16 px-4">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-4xl font-bold tracking-tight mb-4">
        {{ aboutCopy.hero.headline }}
      </h1>
      <p class="text-xl text-muted-foreground mb-12">
        {{ aboutCopy.hero.subheadline }}
      </p>

      <div
        class="max-w-none text-lg leading-relaxed space-y-6"
      >
        <p v-html="aboutCopy.content.confession" />

        <p v-for="(paragraph, index) in aboutCopy.content.intro" :key="index" v-html="paragraph" />

        <div
          class="not-prose my-12 p-8 border border-border rounded-xl bg-muted/30"
        >
          <h2 class="text-xl font-semibold mb-4 text-foreground">
            {{ aboutCopy.content.intent_box.title }}
          </h2>
          <p class="text-muted-foreground mb-0">
            {{ aboutCopy.content.intent_box.description }}
          </p>
          <div class="mt-6 grid gap-4 sm:grid-cols-3">
            <div v-for="strategy in aboutCopy.content.intent_box.strategies" :key="strategy.name" class="p-4 rounded-lg bg-background border border-border">
              <p class="font-semibold text-foreground text-sm">{{ strategy.name }}</p>
              <p class="text-xs text-muted-foreground mt-1">
                {{ strategy.for }}
              </p>
            </div>
          </div>
        </div>

        <p v-html="aboutCopy.content.pipelines" />

        <p v-html="aboutCopy.content.sharing" />

        <div
          class="not-prose mt-12 p-8 border border-border rounded-xl bg-muted/30"
        >
          <h2 class="text-xl font-semibold mb-4 text-foreground">
            {{ aboutCopy.content.validation_box.title }}
          </h2>
          <p class="text-muted-foreground italic mb-0">
            {{ aboutCopy.content.validation_box.description }}
          </p>
        </div>

        <div class="mt-8 text-center text-muted-foreground">
          <p>
            {{ aboutCopy.content.footer.text }}
            <NuxtLink
              :to="aboutCopy.content.footer.cta_link"
              class="text-primary hover:underline font-medium"
              >{{ aboutCopy.content.footer.cta_text }}</NuxtLink
            >.
          </p>
        </div>

        <div class="flex items-center justify-center pt-8">
          <Button v-umami="'about-cta'" as-child size="lg">
            <NuxtLink to="/">{{ aboutCopy.content.final_cta }}</NuxtLink>
          </Button>
        </div>
      </div>
    </div>
  </main>
</template>
