<script setup lang="ts">
import landingCopy from "~/content/landing-copy";
</script>

<template>
  <section class="py-24 px-4 bg-muted/30 mb-12">
    <div class="max-w-2xl mx-auto text-center">
      <h2
        class="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-[0.95]"
      >
        {{ landingCopy.final_cta.headline }}
      </h2>
      <p class="text-xl text-muted-foreground mb-10">
        {{ landingCopy.final_cta.subheadline }}
      </p>
      <div class="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <Button size="lg" class="text-lg px-10 py-6" as-child>
          <NuxtLink to="/app">{{ landingCopy.final_cta.cta }}</NuxtLink>
        </Button>
        <Button size="lg" variant="outline" class="text-lg px-8 py-6" as-child>
          <NuxtLink to="/app">{{
            landingCopy.final_cta.cta_secondary
          }}</NuxtLink>
        </Button>
      </div>
      <p class="mt-6 text-sm text-muted-foreground">
        {{ landingCopy.final_cta.note }}
      </p>
    </div>
  </section>
</template>
