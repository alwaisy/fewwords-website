<script setup lang="ts">
const plans = [
  {
    name: "Skim",
    price: "0",
    credits: 8,
    features: ["8 Article summaries", "No YouTube access", "Instant access"]
  },
  {
    name: "Read",
    price: "4",
    credits: 30,
    features: ["30 Articles", "10 YouTube (Short)", "4 YouTube (Medium)"],
    popular: true
  },
  {
    name: "Digest",
    price: "9",
    credits: 90,
    features: ["90 Articles", "45 YouTube (Short)", "15 YouTube (Medium)"]
  }
];
</script>

<template>
  <section id="pricing" class="py-24 bg-muted/30 border-y">
    <div class="container max-w-5xl mx-auto px-4">
      <div class="text-center mb-16 space-y-4">
        <h2 class="text-3xl md:text-5xl font-bold tracking-tight">Simple Pricing</h2>
        <p class="text-muted-foreground text-lg">Choose a plan that fits your reading habits.</p>
      </div>

      <div class="grid md:grid-cols-3 gap-6">
        <div 
          v-for="plan in plans" 
          :key="plan.name"
          :class="[
            'p-8 rounded-2xl border bg-card flex flex-col',
            plan.popular ? 'border-primary shadow-lg scale-105 z-10' : 'border-border'
          ]"
        >
          <div class="mb-6">
            <h3 class="text-xl font-bold">{{ plan.name }}</h3>
            <div class="mt-4 flex items-baseline gap-1">
              <span class="text-3xl font-bold">${{ plan.price }}</span>
              <span class="text-muted-foreground text-sm">/mo</span>
            </div>
            <p class="text-primary font-medium mt-1 text-sm">{{ plan.credits }} credits</p>
          </div>

          <ul class="space-y-3 mb-8 flex-grow text-sm">
            <li v-for="f in plan.features" :key="f" class="flex items-center gap-2">
              <Icon name="lucide:check" class="size-4 text-green-500" />
              {{ f }}
            </li>
          </ul>

          <Button :variant="plan.popular ? 'default' : 'outline'" class="w-full" as-child>
            <NuxtLink to="/pricing">
              {{ plan.name === 'Skim' ? 'Start Free' : 'Get Started' }}
            </NuxtLink>
          </Button>
        </div>
      </div>

      <div class="mt-12 text-center">
        <NuxtLink to="/pricing" class="text-muted-foreground hover:text-primary transition-colors text-sm font-medium flex items-center justify-center gap-1">
          View full plan comparison <Icon name="lucide:arrow-right" class="size-4" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
