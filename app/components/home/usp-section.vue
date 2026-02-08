<script setup lang="ts">
import landingCopy from "~/content/landing-copy";
</script>

<template>
  <section class="py-24 px-4 border-t border-border">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-5xl font-bold text-foreground mb-6">
          {{ landingCopy.usp_section.headline }}
        </h2>
        <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
          {{ landingCopy.usp_section.subheadline }}
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-x-4 gap-y-6">
        <div
          v-for="(u, idx) in landingCopy.usp_section.points"
          :key="idx"
          class="p-6 rounded-xl bg-card border border-border"
        >
          <div class="mb-4">
            <Icon
              :name="['lucide:copy', 'lucide:slash', 'lucide:share-2'][idx]!"
              class="w-8 h-8 text-primary"
            />
          </div>
          <h3 class="text-xl font-bold mb-2">{{ u.title }}</h3>
          <p class="text-muted-foreground">{{ u.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
