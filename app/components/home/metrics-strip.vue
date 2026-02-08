<script setup lang="ts">
import landingCopy from '~/content/landing-copy'
</script>

<template>
  <div class="w-full border-y border-border/50 bg-muted/20">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center text-center">
        <div v-for="(m, idx) in landingCopy.metrics_strip" :key="idx" class="space-y-1">
          <div class="text-3xl font-bold text-primary">{{ m.value }}</div>
          <div class="text-sm text-muted-foreground font-medium">{{ m.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
