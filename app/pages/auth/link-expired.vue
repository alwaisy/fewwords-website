<script setup lang="ts">
useSeoMeta({
  title: "Link Expired - Fewwords",
  titleTemplate: null,
  robots: { index: false, follow: false },
});

definePageMeta({
  layout: 'auth'
})

const email = ref('')
const isResending = ref(false)

async function handleResend() {
  if (!email.value) return

  isResending.value = true
  // TODO: Implement resend logic
  setTimeout(() => {
    isResending.value = false
  }, 2000)
}
</script>

<template>
  <div class="w-full max-w-md text-center">
    <div class="mb-8">
      <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
        <Icon name="lucide:alert-circle" class="w-10 h-10 text-destructive" />
      </div>
      <h1 class="text-2xl font-bold text-foreground mb-2">
        Link expired
      </h1>
      <p class="text-muted-foreground">
        Magic links expire after 15 minutes
      </p>
    </div>

    <div class="bg-card border border-border rounded-lg p-6 mb-8 text-left">
      <p class="text-sm text-muted-foreground mb-4">
        Enter your email to get a new link:
      </p>
      <form class="space-y-4" @submit.prevent="handleResend">
        <Input
          v-model="email"
          type="email"
          placeholder="you@example.com"
          required
        />
        <Button
          type="submit"
          variant="default"
          size="lg"
          class="w-full"
          :disabled="isResending"
        >
          <Icon v-if="isResending" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
          {{ isResending ? 'Sending...' : 'Resend link' }}
        </Button>
      </form>
    </div>

    <NuxtLink to="/auth/login" class="block text-sm text-muted-foreground hover:text-foreground transition-colors">
      Back to sign in
    </NuxtLink>
  </div>
</template>
