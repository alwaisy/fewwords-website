<script setup lang="ts">
import landingCopy from "~/content/landing-copy";
</script>

<template>
  <section class="py-24 px-4 bg-muted/20 border-y border-border">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-16">
        <h2
          class="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight"
        >
          {{ landingCopy.problem_section.headline }}
        </h2>
        <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
          {{ landingCopy.problem_section.supporting_copy }}
        </p>
      </div>

      <div class="space-y-12">
        <div
          v-for="(step, i) in landingCopy.problem_section.steps"
          :key="i"
          class="flex gap-6 items-start"
        >
          <div
            class="shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <span class="text-primary font-bold">{{
              String(i + 1).padStart(2, "0")
            }}</span>
          </div>
          <div>
            <h3 class="text-xl font-semibold text-foreground mb-2">
              {{ step.title }}
            </h3>
            <p class="text-lg text-muted-foreground leading-relaxed">
              {{ step.body }}
            </p>
          </div>
        </div>
      </div>

      <div class="mt-16 text-center">
        <p class="text-xl text-muted-foreground">
          {{ landingCopy.problem_section.closing }}
        </p>
      </div>
    </div>
  </section>
</template>
