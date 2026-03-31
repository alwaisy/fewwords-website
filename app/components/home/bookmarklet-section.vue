<script setup lang="ts">
import landingCopy from '~/content/landing-copy'

const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl as string || ''

const bookmarkletUrl = `javascript:(function(){window.location.href='${siteUrl}/app?url='+encodeURIComponent(window.location.href)})()`
</script>

<template>
  <section class="py-24 px-4 bg-muted/30">
    <div class="max-w-3xl mx-auto text-center">
      <h2 class="text-3xl md:text-4xl font-bold text-foreground mb-4">
        {{ landingCopy.bookmarklet_section.headline }}
      </h2>
      <p class="text-xl text-muted-foreground mb-12">
        {{ landingCopy.bookmarklet_section.subheadline }}
      </p>

      <div class="mb-12">
        <a
          :href="bookmarkletUrl"
          class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors cursor-grab active:cursor-grabbing select-none"
        >
          <Icon name="lucide:bookmark" class="w-5 h-5" />
          Summarize with Fewwords
        </a>
        <p class="mt-4 text-sm text-muted-foreground">Drag this to your bookmarks bar</p>
      </div>

      <div class="text-left space-y-4 max-w-xl mx-auto">
        <div v-for="(step, i) in landingCopy.bookmarklet_section.steps" :key="i" class="flex gap-4">
          <span class="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
            {{ i + 1 }}
          </span>
          <p class="text-muted-foreground">{{ step }}</p>
        </div>
      </div>

      <p class="mt-8 text-sm text-muted-foreground">
        {{ landingCopy.bookmarklet_section.note }}
      </p>
    </div>
  </section>
</template>
