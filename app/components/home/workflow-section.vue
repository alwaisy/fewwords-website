<script setup lang="ts">
import landingCopy from "~/content/landing-copy";
</script>

<template>
  <section class="py-24 px-4 bg-muted/30">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-5xl font-bold text-foreground mb-4">
          {{ landingCopy.workflow_section.headline }}
        </h2>
        <p class="text-xl text-muted-foreground">
          {{ landingCopy.workflow_section.subheadline }}
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-8">
        <!-- Without Fewwords -->
        <div class="space-y-4 justify-self-center">
          <div class="flex items-center gap-3 mb-6">
            <div
              class="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
            >
              <Icon name="lucide:x" class="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 class="text-xl font-semibold text-muted-foreground">
              Without Fewwords
            </h3>
          </div>
          <div
            v-for="(item, i) in landingCopy.workflow_section.without"
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
            <h3 class="text-xl font-semibold text-foreground">With Fewwords</h3>
          </div>
          <div
            v-for="(item, i) in landingCopy.workflow_section.with"
            :key="i"
            class="flex items-start gap-3 pl-13"
          >
            <span class="text-primary/70 mt-0.5 font-bold">{{ i + 1 }}.</span>
            <p class="text-foreground font-medium">{{ item }}</p>
          </div>
        </div>
      </div>

      <div class="mt-12 text-center">
        <p class="text-lg text-muted-foreground">
          {{ landingCopy.workflow_section.note }}
        </p>
      </div>
    </div>
  </section>
</template>
