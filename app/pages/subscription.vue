<script setup lang="ts">
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

useSeoMeta({
  title: "Your plan - Fewwords",
  robots: { index: false, follow: false },
});

definePageMeta({
  middleware: "auth",
});

const { user } = useAuth();
const { quota, usageText, percentUsed, refresh } = useQuota();
const { upgrade, openPortal, isUpgrading } = usePolar();
const config = useRuntimeConfig();

const { data: products } = useFetch("/api/prices");

interface PolarProduct {
  id: string;
  name: string;
}

const getProductId = (name: string) => {
  return (
    (products.value as unknown as PolarProduct[])?.find(
      (p) => p.name.toLowerCase() === name.toLowerCase(),
    )?.id || null
  );
};

const formatDate = (dateStr: string | Date) => {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
};

onMounted(() => {
  refresh();
});
</script>

<template>
  <main class="min-h-screen bg-background py-12 px-4">
    <div class="max-w-2xl mx-auto">
      <div class="mb-8">
        <h1 class="text-2xl font-bold">Your plan</h1>
        <p class="text-muted-foreground text-sm mt-1">
          Credits, upgrades, billing. All in one place.
        </p>
      </div>

      <ClientOnly>
        <div v-if="user" class="space-y-6">
          <Card class="shadow-sm">
            <CardHeader class="flex flex-row items-center justify-between pb-6">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <p
                    class="text-xs font-bold text-primary uppercase tracking-wider"
                  >
                    Current Plan
                  </p>
                  <Badge
                    v-if="quota.cancelAtPeriodEnd"
                    variant="destructive"
                    class="text-[10px] uppercase h-5"
                  >
                    Cancels at period end
                    <span v-if="quota.periodResetAt" class="ml-1 opacity-80"
                      >({{ formatDate(quota.periodResetAt) }})</span
                    >
                  </Badge>
                </div>
                <CardTitle class="text-3xl font-bold">
                  {{ quota.plan.charAt(0).toUpperCase() + quota.plan.slice(1) }}
                </CardTitle>
              </div>

              <div
                class="bg-muted px-4 py-2 rounded text-center border border-border/50"
              >
                <div
                  class="text-[10px] font-bold text-muted-foreground uppercase"
                >
                  Credits left
                </div>
                <div class="text-xl font-bold tabular-nums">
                  {{ quota.creditsLimit - quota.creditsUsed }}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div class="space-y-2">
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-muted-foreground">{{ usageText }}</span>
                  <span class="font-bold">{{ percentUsed }}%</span>
                </div>
                <Progress :model-value="percentUsed" class="h-2" />
              </div>
            </CardContent>

            <CardFooter class="grid sm:grid-cols-2 gap-3">
              <template v-if="config.public.isPolarConfigured">
                <Button
                  v-if="quota.plan === 'skim' || !quota.plan"
                  :disabled="isUpgrading || !getProductId('Read')"
                  @click="upgrade(getProductId('Read'), 'Read')"
                >
                  <Icon
                    v-if="isUpgrading"
                    name="lucide:loader-2"
                    class="mr-2 h-4 w-4 animate-spin"
                  />
                  {{ isUpgrading ? "Processing..." : "Upgrade to Read" }}
                </Button>
                <Button
                  v-else-if="quota.plan === 'read'"
                  :disabled="isUpgrading || !getProductId('Digest')"
                  @click="upgrade(getProductId('Digest'), 'Digest')"
                >
                  <Icon
                    v-if="isUpgrading"
                    name="lucide:loader-2"
                    class="mr-2 h-4 w-4 animate-spin"
                  />
                  {{ isUpgrading ? "Processing..." : "Upgrade to Digest" }}
                </Button>

                <Button
                  v-if="quota.plan && quota.plan !== 'skim'"
                  variant="outline"
                  :disabled="isUpgrading"
                  @click="openPortal"
                >
                  Manage Billing
                </Button>
                <Button v-else variant="outline" as-child>
                  <NuxtLink to="/pricing">Explore Plans</NuxtLink>
                </Button>
              </template>
              <template v-else>
                <div class="col-span-2 py-2">
                  <p class="text-sm text-muted-foreground text-center">
                    Paid plans are not live yet. I'm still wiring up the
                    payments. Back soon.
                  </p>
                </div>
              </template>
            </CardFooter>
          </Card>

          <div class="grid gap-4">
            <Card v-if="user.periodResetAt" class="bg-muted/30">
              <CardContent class="p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <Icon
                    name="lucide:refresh-cw"
                    class="size-5 text-muted-foreground"
                  />
                  <span class="text-sm font-medium">Credits reset on</span>
                </div>
                <div class="text-sm font-bold font-mono">
                  {{ formatDate(user.periodResetAt) }}
                </div>
              </CardContent>
            </Card>

            <Card class="bg-muted/10 border-none shadow-none">
              <CardContent
                class="p-4 flex items-center gap-3 text-muted-foreground"
              >
                <Icon name="lucide:shield-check" class="size-4" />
                <span class="text-xs uppercase tracking-wider font-bold"
                  >Secure Billing via Polar</span
                >
              </CardContent>
            </Card>
          </div>
        </div>

        <template #fallback>
          <Skeleton class="h-64 w-full rounded-lg" />
        </template>
      </ClientOnly>
    </div>
  </main>
</template>
