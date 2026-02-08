<script setup lang="ts">
import landingCopy from '~/content/landing-copy'
</script>

<template>
  <section class="py-24 px-4">
    <div class="max-w-3xl mx-auto space-y-8">
      <div v-for="(p, i) in landingCopy.problem_agitation" :key="i" :class="['pl-6', 'border-l-4', i === landingCopy.problem_agitation.length - 1 ? 'border-muted' : 'border-primary']">
        <p :class="i === landingCopy.problem_agitation.length - 1 ? 'text-xl text-muted-foreground leading-relaxed' : 'text-xl text-foreground leading-relaxed'">{{ p }}</p>
      </div>
    </div>
  </section>
</template>
