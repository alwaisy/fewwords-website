<script setup lang="ts">
import landingCopy from "~/content/landing-copy";
</script>

<template>
  <section class="py-24 px-4">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-5xl font-bold text-foreground mb-4">
          {{ landingCopy.features_section.headline }}
        </h2>
        <p class="text-xl text-muted-foreground">
          {{ landingCopy.features_section.subheadline }}
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <div
          v-for="(f, idx) in landingCopy.features_section.features"
          :key="idx"
          class="group bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-colors"
        >
          <div class="flex items-center gap-3 mb-4">
            <Icon
              :name="
                [
                  'lucide:file-text',
                  'lucide:play-circle',
                  'lucide:message-square',
                  'lucide:link',
                ][idx]!
              "
              class="w-10 h-10 text-primary"
            />
            <span
              class="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded"
              >{{ f.tag }}</span
            >
          </div>
          <h3 class="text-xl font-semibold text-foreground mb-2">
            {{ f.title }}
          </h3>
          <p class="text-muted-foreground">{{ f.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
