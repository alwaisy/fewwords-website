<script setup lang="ts">
const { isLoggedIn } = useAuth()
const { gateMessage, refresh } = useQuota()

// Refresh quota when component mounts
onMounted(() => {
  refresh()
})
</script>

<template>
  <div v-if="gateMessage" class="w-full max-w-2xl mx-auto my-8">
    <div class="rounded-2xl border-2 border-primary/20 bg-card p-10 text-center space-y-6 shadow-sm">
      <div class="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
        <Icon name="lucide:zap" class="size-8 text-primary" />
      </div>
      
      <div class="space-y-2">
        <h3 class="text-2xl font-bold text-foreground">
          {{ isLoggedIn ? "Out of Credits" : "Limit Reached" }}
        </h3>
        <p class="text-muted-foreground text-lg max-w-md mx-auto">
          {{ gateMessage }}
        </p>
      </div>

      <!-- Not logged in: show sign-up CTA -->
      <div v-if="!isLoggedIn" class="flex flex-col items-center justify-center gap-4">
        <Button as-child size="lg" class="h-12 px-8 text-lg rounded-xl">
          <NuxtLink to="/auth/login">
            Sign up for 8 free credits
          </NuxtLink>
        </Button>
        <span class="text-sm text-muted-foreground">No credit card required</span>
      </div>

      <!-- Logged in: show upgrade CTA -->
      <div v-else class="flex flex-col items-center justify-center gap-4">
        <Button
          as-child
          size="lg"
          class="h-12 px-8 text-lg rounded-xl"
        >
          <NuxtLink to="/pricing">
            Upgrade to Read
          </NuxtLink>
        </Button>
        <span class="text-sm text-muted-foreground">Instant access to 30+ credits</span>
      </div>
    </div>
  </div>
</template>
