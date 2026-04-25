<script setup lang="ts">
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import pricingCopy from "~/content/pricing-copy";

const { isLoggedIn } = useAuth();
const { quota, refresh: refreshQuota } = useQuota();
const { upgrade, isUpgrading } = usePolar();
const config = useRuntimeConfig();

const { data: products, pending } = useFetch('/api/prices');

onMounted(async () => {
  await refreshQuota(); // Ensure we have the latest plan from DB
});

// Use quota.plan as the source of truth for "current plan"
const isCurrentPlan = (planName: string) => {
  return quota.value.plan.toLowerCase() === planName.toLowerCase();
};

const formatPrice = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount / 100);
};

interface PolarPrice {
  price_amount?: number;
  priceAmount?: number;
  price_currency?: string;
  priceCurrency?: string;
}

interface PolarProduct {
  id: string;
  name: string;
  description?: string | null;
  prices: PolarPrice[];
}

interface PlanUI {
  name: string;
  description: string;
  price: string;
  credits: number;
  features: string[];
  popular: boolean;
  cta: string;
  productId: string | null;
  priceRaw: number;
}

const plans = computed<PlanUI[]>(() => {
  const skimCopy = pricingCopy.plans.find(p => p.name === 'Skim')!;
  const skimPlan: PlanUI = {
    name: skimCopy.name,
    description: skimCopy.description,
    price: "$0",
    credits: skimCopy.credits,
    features: skimCopy.features,
    popular: skimCopy.popular,
    cta: skimCopy.cta,
    productId: null,
    priceRaw: 0
  };

  if (!products.value) return [skimPlan];

  const paidPlans = (products.value as unknown as PolarProduct[]).map(product => {
    // Find matching copy from pricingCopy based on name
    const copy = pricingCopy.plans.find(p => p.name.toLowerCase() === product.name.toLowerCase());

    const firstPrice = product.prices?.[0];
    const priceAmount = firstPrice?.priceAmount ?? firstPrice?.price_amount ?? 0;
    const priceCurrency = firstPrice?.priceCurrency ?? firstPrice?.price_currency ?? 'USD';

    return {
      name: product.name,
      description: product.description || (copy?.description || ""),
      price: formatPrice(priceAmount, priceCurrency),
      priceRaw: priceAmount,
      credits: copy?.credits || 0,
      features: copy?.features || [],
      popular: copy?.popular || false,
      cta: copy?.cta || "Upgrade",
      productId: product.id
    };
  });

  // Sort paid plans by price ascending
  paidPlans.sort((a, b) => a.priceRaw - b.priceRaw);

  return [skimPlan, ...paidPlans];
});

const costs = pricingCopy.costs;
const faqs = pricingCopy.faqs;
</script>

<template>
  <div class="min-h-screen bg-background py-16 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Fallback Content (When not configured) -->
      <template v-if="!config.public.isPolarConfigured">
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
          <div v-if="pending" class="grid md:grid-cols-3 gap-8 mb-24">
            <Skeleton v-for="i in 3" :key="i" class="h-[500px] rounded-lg" />
          </div>
          <div v-else class="grid md:grid-cols-3 gap-4 mb-24 items-stretch">
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
                <!-- <CardDescription>{{ plan.description }}</CardDescription> -->
              </CardHeader>

              <CardContent class="flex-grow">
                <div class="mb-6">
                  <div class="flex items-baseline gap-1">
                    <span class="text-3xl font-bold">{{ plan.price }}</span>
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
                  @click="upgrade(plan.productId, plan.name)"
                >
                  <Icon v-if="isUpgrading" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
                  {{ isCurrentPlan(plan.name) ? "Current Plan" : (isUpgrading ? "Processing..." : plan.cta) }}
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
