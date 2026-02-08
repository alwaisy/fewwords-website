<script setup lang="ts">
import landingCopy from '~/content/landing-copy'
</script>

<template>
  <section class="py-24 px-4">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-2xl md:text-3xl font-bold text-foreground mb-12 text-center">
        No BS. Just works.
      </h2>

      <div class="grid md:grid-cols-2 gap-6">
        <div v-for="(f, idx) in landingCopy.features_section" :key="idx" class="group bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-colors">
          <Icon :name="['lucide:file-video','lucide:sparkles','lucide:zap','lucide:share-2'][idx]!" class="w-10 h-10 text-primary mb-4" />
          <h3 class="text-xl font-semibold text-foreground mb-2">{{ f.title }}</h3>
          <p class="text-muted-foreground">{{ f.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
