<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import pricingCopy from "~/content/pricing-copy";

const { isLoggedIn } = useAuth();
const { quota, refresh: refreshQuota } = useQuota();
const { upgrade, isUpgrading, fetchPrices } = usePaddle();
const config = useRuntimeConfig();

const dynamicPrices = ref<Record<string, string>>({});

onMounted(async () => {
  await refreshQuota(); // Ensure we have the latest plan from DB
  const prices = await fetchPrices();
  console.log('[Paddle] Dynamic Prices Loaded:', prices);
  prices.forEach((p) => {
    dynamicPrices.value[p.id] = p.formatted;
  });
});

const getPrice = (priceId: string | null, fallback: string) => {
  if (!priceId) return fallback;
  return dynamicPrices.value[priceId] || fallback;
};

// Use quota.plan as the source of truth for "current plan"
const isCurrentPlan = (planName: string) => {
  return quota.value.plan.toLowerCase() === planName.toLowerCase();
};

const plans = computed(() => pricingCopy.plans.map(plan => {
  const prices = config.public.prices as Record<string, string>;
  const priceId = (plan.priceIdKey ? prices[plan.priceIdKey] : null) ?? null;
  return {
    ...plan,
    price: getPrice(priceId, plan.fallbackPrice),
    priceId
  };
}));

const costs = pricingCopy.costs;

const showDeepPlan = ref(false); 
const deepPlan = computed(() => {
  const plan = pricingCopy.deep_plan;
  const prices = config.public.prices as Record<string, string>;
  const priceId = prices[plan.priceIdKey] ?? null;
  return {
    ...plan,
    price: getPrice(priceId, plan.fallbackPrice),
    priceId
  };
});

const faqs = pricingCopy.faqs;
</script>

<template>
  <div class="min-h-screen bg-background py-16 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Fallback Content (When not approved) -->
      <template v-if="!config.public.paddleApproved">
        <div class="max-w-2xl mx-auto text-center py-20">
          <div class="inline-flex items-center justify-center p-3 mb-8 rounded-full bg-primary/10 text-primary">
            <Icon name="lucide:rocket" class="size-8" />
          </div>
          <h1 class="text-4xl font-bold tracking-tight mb-4">
            Paid Plans Coming Soon
          </h1>
          <p class="text-lg text-muted-foreground mb-8">
            Fewwords is currently in closed beta while I finalize the payment systems. 
            All core features are available to explore for free right now.
          </p>
          
          <div class="grid gap-6">
            <Card class="bg-muted/30 border-dashed text-left">
              <CardHeader>
                <CardTitle>Public Beta Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-sm text-muted-foreground mb-4">
                  Sign up today to get early access and free credits. I'll notify you the moment the Pro plans go live.
                </p>
                <Button v-if="!isLoggedIn" variant="default" @click="navigateTo('/auth/login')">
                  Create Free Account
                </Button>
                <Button v-else variant="outline" @click="navigateTo('/app')">
                  Read Fast
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </template>

      <!-- Original Pricing Content (When approved) -->
      <template v-else>
        <div class="text-center mb-16 space-y-4">
          <h1 class="text-4xl md:text-5xl font-bold tracking-tight">
            {{ pricingCopy.hero.headline }}
          </h1>
          <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
            {{ pricingCopy.hero.subheadline }}
          </p>
        </div>

        <ClientOnly>
          <div class="grid md:grid-cols-3 gap-8 mb-24 items-stretch">
            <Card 
              v-for="plan in plans" 
              :key="plan.name"
              :class="[
                'relative flex flex-col transition-colors',
                plan.popular ? 'border-primary shadow-sm' : ''
              ]"
            >
              <div v-if="plan.popular" class="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-0.5 rounded-full text-xs font-medium">
                Most Popular
              </div>
              
              <CardHeader>
                <CardTitle class="text-xl">{{ plan.name }}</CardTitle>
                <CardDescription>{{ plan.description }}</CardDescription>
              </CardHeader>

              <CardContent class="flex-grow">
                <div class="mb-6">
                  <div class="flex items-baseline gap-1">
                    <span class="text-3xl font-bold">${{ plan.price }}</span>
                    <span class="text-muted-foreground text-sm">/month</span>
                  </div>
                  <div class="mt-1 text-primary font-medium text-xs">
                    {{ plan.credits }} credits included
                  </div>
                </div>

                <ul class="space-y-3">
                  <li v-for="feature in plan.features" :key="feature" class="flex items-start gap-2 text-sm">
                    <Icon name="lucide:check" class="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span class="text-muted-foreground">{{ feature }}</span>
                  </li>
                </ul>
              </CardContent>

              <CardFooter>
                <Button 
                  :variant="isCurrentPlan(plan.name) ? 'outline' : (plan.popular ? 'default' : 'outline')"
                  class="w-full" 
                  :disabled="isCurrentPlan(plan.name) || isUpgrading"
                  @click="upgrade(plan.priceId, plan.name)"
                >
                  <Icon v-if="isUpgrading" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
                  {{ isCurrentPlan(plan.name) ? "Current Plan" : (isUpgrading ? "Processing..." : plan.cta) }}
                </Button>
              </CardFooter>
            </Card>

            <Card v-if="showDeepPlan" class="border-dashed flex flex-col items-center justify-center text-center">
              <CardHeader class="pb-2">
                <Icon name="lucide:zap" class="w-8 h-8 mb-3 text-muted-foreground mx-auto" />
                <CardTitle class="text-lg">Need even more?</CardTitle>
              </CardHeader>
              <CardContent>
                <p class="text-muted-foreground text-xs">Our Deep plan offers 225 credits for power users.</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" :disabled="isUpgrading" @click="upgrade(deepPlan.priceId, deepPlan.name)">
                  <Icon v-if="isUpgrading" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
                  Contact for Access
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <template #fallback>
            <div class="grid md:grid-cols-3 gap-8 mb-24">
              <Skeleton v-for="i in 3" :key="i" class="h-96 rounded-lg" />
            </div>
          </template>
        </ClientOnly>

        <div class="max-w-4xl mx-auto mb-24">
          <Card class="bg-muted/50">
            <CardHeader>
              <CardTitle class="text-xl text-center font-bold">How credits work</CardTitle>
            </CardHeader>
            <CardContent class="grid gap-2">
              <div v-for="item in costs" :key="item.type" class="flex items-center justify-between p-3 rounded-md bg-background border border-border/50">
                <div class="text-sm font-medium">{{ item.type }}</div>
                <div class="flex items-center gap-3">
                  <span class="text-primary font-bold text-sm">{{ item.cost }}</span>
                  <Badge variant="secondary" class="text-[10px] uppercase tracking-tight font-bold">
                    {{ item.note }}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter class="justify-center border-t py-4">
              <p class="text-center text-xs text-muted-foreground">
                Credits reset every billing cycle. Unused credits do not roll over.
              </p>
            </CardFooter>
          </Card>
        </div>

        <div class="max-w-3xl mx-auto border-t pt-20">
          <h2 class="text-2xl font-bold text-center mb-12">Questions & Answers</h2>
          <Accordion type="single" collapsible class="w-full">
            <AccordionItem v-for="(faq, index) in faqs" :key="index" :value="`item-${index}`">
              <AccordionTrigger class="text-left font-semibold">
                {{ faq.q }}
              </AccordionTrigger>
              <AccordionContent class="text-muted-foreground leading-relaxed">
                <div v-if="faq.q.includes('behind')" class="space-y-2">
                  <p>{{ faq.a }}</p>
                  <NuxtLink to="/about" class="inline-flex items-center text-primary text-sm hover:underline gap-1">
                    Read my story <Icon name="lucide:arrow-right" class="size-3" />
                  </NuxtLink>
                </div>
                <div v-else>
                  {{ faq.a }}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div class="mt-24 text-center p-12 rounded-lg bg-muted/30 border border-border">
          <h2 class="text-3xl font-bold mb-4">{{ pricingCopy.footer_cta.headline }}</h2>
          <p class="text-muted-foreground mb-8">{{ pricingCopy.footer_cta.subheadline }}</p>
          
          <ClientOnly>
            <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button v-if="!isLoggedIn" variant="default" @click="navigateTo('/auth/login')">
                {{ pricingCopy.footer_cta.cta_primary }}
              </Button>
              <Button v-else variant="default" @click="navigateTo('/app')">
                {{ pricingCopy.footer_cta.cta_authenticated }}
              </Button>
              <Button v-if="!isLoggedIn" variant="outline" @click="navigateTo('/')">
                {{ pricingCopy.footer_cta.cta_secondary }}
              </Button>
            </div>          </ClientOnly>
        </div>
      </template>
    </div>
  </div>
</template>
