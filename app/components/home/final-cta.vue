<script setup lang="ts">
import landingCopy from '~/content/landing-copy'
</script>

<template>
  <section class="py-24 px-4 bg-muted/30 mb-12">
    <div class="max-w-2xl mx-auto text-center">
      <h2 class="text-4xl md:text-6xl font-bold text-foreground mb-8 leading-[0.95]">
        {{ landingCopy.final_cta.headline }}
      </h2>
      <Button size="lg" class="text-lg px-10 py-6" as-child>
        <NuxtLink to="/app">{{ landingCopy.final_cta.cta }}</NuxtLink>
      </Button>
      <p class="mt-6 text-sm text-muted-foreground">{{ landingCopy.final_cta.note }}</p>
    </div>
  </section>
</template>
