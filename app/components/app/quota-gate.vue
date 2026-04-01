<script setup lang="ts">
const { isLoggedIn } = useAuth()
const { quota, gateMessage, refresh } = useQuota()
const isJoining = ref(false)
const joined = ref(false)

async function joinWaitlist() {
  if (isJoining.value) return
  isJoining.value = true

  try {
    const email = isLoggedIn.value
      ? (quota.value as { email?: string }).email
      : undefined

    const res = await $fetch<{ success: boolean; message: string; alreadyExists: boolean }>('/api/waitlist', {
      method: 'POST',
      body: email ? { email } : {},
    })

    if (res.success) {
      joined.value = true
      useToastify(res.message, { type: 'success' })
    }
  } catch {
    useToastify('Failed to join waitlist. Try again.', { type: 'error' })
  } finally {
    isJoining.value = false
  }
}

// Refresh quota when component mounts
onMounted(() => {
  refresh()
})
</script>

<template>
  <div v-if="gateMessage && !joined" class="w-full max-w-2xl mx-auto">
    <div class="rounded-xl border border-border bg-card p-8 text-center space-y-4">
      <Icon name="lucide:lock" class="size-10 text-muted-foreground mx-auto" />
      <h3 class="text-xl font-semibold text-foreground">
        {{ isLoggedIn ? "You've used your free words" : "You've hit your free limit" }}
      </h3>
      <p class="text-muted-foreground">
        {{ gateMessage }}
      </p>

      <!-- Not logged in: show sign-up CTA -->
      <div v-if="!isLoggedIn" class="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button as-child size="lg">
          <NuxtLink to="/auth/login">
            Sign up free
          </NuxtLink>
        </Button>
        <span class="text-sm text-muted-foreground">No credit card needed</span>
      </div>

      <!-- Logged in: show waitlist CTA -->
      <div v-else class="flex flex-col items-center justify-center gap-3">
        <Button
          size="lg"
          :disabled="isJoining"
          @click="joinWaitlist"
        >
          <Icon v-if="isJoining" name="lucide:loader-2" class="size-4 mr-2 animate-spin" />
          Join the waitlist
        </Button>
        <span class="text-sm text-muted-foreground">We'll notify you when paid plans launch</span>
      </div>
    </div>
  </div>

  <!-- Already joined -->
  <div v-else-if="joined" class="w-full max-w-2xl mx-auto">
    <div class="rounded-xl border border-border bg-card p-8 text-center space-y-4">
      <Icon name="lucide:check-circle" class="size-10 text-green-500 mx-auto" />
      <h3 class="text-xl font-semibold text-foreground">
        You're on the list
      </h3>
      <p class="text-muted-foreground">
        We'll let you know when paid plans are ready.
      </p>
    </div>
  </div>
</template>
