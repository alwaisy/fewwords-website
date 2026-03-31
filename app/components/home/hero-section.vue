<script setup lang="ts">
import landingCopy from "~/content/landing-copy";
</script>

<template>
  <section class="py-24 md:py-40 px-4 border-b border-border">
    <div class="max-w-4xl mx-auto">
      <h1
        class="text-5xl md:text-7xl font-bold text-foreground mb-8 leading-[0.95] tracking-tight"
      >
        {{ landingCopy.hero_section.headline }}
      </h1>
      <p class="text-2xl text-muted-foreground mb-12 max-w-2xl leading-relaxed">
        {{ landingCopy.hero_section.subheadline }}
      </p>
      <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Button size="lg" class="text-lg px-8 py-6" as-child>
          <NuxtLink to="/app">{{ landingCopy.hero_section.cta }}</NuxtLink>
        </Button>
        <Button size="lg" variant="link" class="text-lg text-muted-foreground" as-child>
          <a href="#bookmarklet">Get the one-click bookmarklet</a>
        </Button>
      </div>
    </div>
  </section>
</template>
