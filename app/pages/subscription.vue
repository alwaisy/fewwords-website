<script setup lang="ts">
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

useSeoMeta({
  title: "Subscription - Fewwords",
  robots: { index: false, follow: false },
});

definePageMeta({
  middleware: 'auth'
})

const { user } = useAuth()
const { quota, usageText, percentUsed, refresh } = useQuota()
const { upgrade, openPortal, isUpgrading } = usePaddle();
const config = useRuntimeConfig();

onMounted(() => {
  refresh();
})
</script>

<template>
  <main class="min-h-screen bg-background py-12 px-4">
    <div class="max-w-2xl mx-auto">
      <div class="mb-8">
        <h1 class="text-2xl font-bold">
          Subscription
        </h1>
      </div>

      <ClientOnly>
        <div v-if="user" class="space-y-6">
          <Card class="shadow-sm">
            <CardHeader class="flex flex-row items-center justify-between pb-6">
              <div class="space-y-1">
                <p class="text-xs font-bold text-primary uppercase tracking-wider">Current Plan</p>
                <CardTitle class="text-3xl font-bold">
                  {{ quota.plan.charAt(0).toUpperCase() + quota.plan.slice(1) }}
                </CardTitle>
              </div>
              
              <div class="bg-muted px-4 py-2 rounded text-center border border-border/50">
                <div class="text-[10px] font-bold text-muted-foreground uppercase">Remaining</div>
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
              <template v-if="config.public.paddleApproved">
                <Button 
                  v-if="quota.plan === 'skim' || !quota.plan" 
                  :disabled="isUpgrading"
                  @click="upgrade(config.public.prices.read, 'Read')"
                >
                  <Icon v-if="isUpgrading" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
                  {{ isUpgrading ? "Processing..." : "Upgrade to Read" }}
                </Button>
                <Button 
                  v-else-if="quota.plan === 'read'" 
                  :disabled="isUpgrading"
                  @click="upgrade(config.public.prices.digest, 'Digest')"
                >
                  <Icon v-if="isUpgrading" name="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
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
                <Button 
                  v-else 
                  variant="outline" 
                  as-child
                >
                  <NuxtLink to="/pricing">Explore Plans</NuxtLink>
                </Button>
              </template>
              <template v-else>
                <div class="col-span-2 py-2">
                  <p class="text-sm text-muted-foreground italic text-center">
                    Paid plans are currently in closed beta while I finalize the payment systems. Stay tuned!
                  </p>
                </div>
              </template>
            </CardFooter>
          </Card>

          <div class="grid gap-4">
            <Card v-if="user.periodResetAt" class="bg-muted/30">
              <CardContent class="p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <Icon name="lucide:refresh-cw" class="size-5 text-muted-foreground" />
                  <span class="text-sm font-medium">Next Credit Reset</span>
                </div>
                <div class="text-sm font-bold font-mono">
                  {{ new Date(user.periodResetAt).toLocaleDateString() }}
                </div>
              </CardContent>
            </Card>

            <Card class="bg-muted/10 border-none shadow-none">
              <CardContent class="p-4 flex items-center gap-3 text-muted-foreground">
                <Icon name="lucide:shield-check" class="size-4" />
                <span class="text-xs uppercase tracking-wider font-bold">Secure Billing via Paddle</span>
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
