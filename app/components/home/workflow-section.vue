<script setup lang="ts">
import landingCopy from "~/content/landing-copy";
</script>

<template>
  <section id="how-it-works" class="py-24 px-4 bg-muted/30">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-5xl font-bold text-foreground mb-4">
          {{ landingCopy.workflow_section.headline }}
        </h2>
        <p class="text-xl text-muted-foreground">
          {{ landingCopy.workflow_section.subheadline }}
        </p>
      </div>

      <!-- 3 Steps Process -->
      <div class="grid md:grid-cols-3 gap-8 mb-16">
        <div
          v-for="(step, i) in landingCopy.workflow_section.steps"
          :key="i"
          class="text-center"
        >
          <div
            class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
          >
            <span class="text-primary text-xl font-bold">{{
              step.number
            }}</span>
          </div>
          <h3 class="text-xl font-semibold text-foreground mb-2">
            {{ step.title }}
          </h3>
          <p class="text-muted-foreground">{{ step.description }}</p>
        </div>
      </div>

      <!-- Comparison -->
      <div class="grid md:grid-cols-2 gap-8 border-t border-border pt-16">
        <!-- Without Fewwords -->
        <div class="space-y-4 justify-self-center">
          <div class="flex items-center gap-3 mb-6">
            <div
              class="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
            >
              <Icon name="lucide:x" class="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 class="text-xl font-semibold text-muted-foreground">
              {{ landingCopy.workflow_section.comparison.without.label }}
            </h3>
          </div>
          <div
            v-for="(item, i) in landingCopy.workflow_section.comparison.without
              .steps"
            :key="i"
            class="flex items-start gap-3 pl-13"
          >
            <span class="text-muted-foreground/50 mt-0.5">{{ i + 1 }}.</span>
            <p class="text-muted-foreground">{{ item }}</p>
          </div>
        </div>

        <!-- With Fewwords -->
        <div class="space-y-4">
          <div class="flex items-center gap-3 mb-6">
            <div
              class="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
            >
              <Icon
                name="lucide:check"
                class="w-5 h-5 text-primary-foreground"
              />
            </div>
            <h3 class="text-xl font-semibold text-foreground">
              {{ landingCopy.workflow_section.comparison.with.label }}
            </h3>
          </div>
          <div
            v-for="(item, i) in landingCopy.workflow_section.comparison.with
              .steps"
            :key="i"
            class="flex items-start gap-3 pl-13"
          >
            <span class="text-primary/70 mt-0.5 font-bold">{{ i + 1 }}.</span>
            <p class="text-foreground font-medium">{{ item }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
