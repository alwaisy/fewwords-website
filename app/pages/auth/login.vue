<script setup lang="ts">
useHead({
  title: 'Sign In - Fewwords',
  titleTemplate: null
})

definePageMeta({
  layout: 'auth'
})

const email = ref('')
const router = useRouter()
const { login, isLoading } = useAuth()

async function handleLogin() {
  if (!email.value) return

  const result = await login(email.value)

  if (result.success) {
    useToastify(result.message || 'Magic link sent!', { type: 'success' })
    router.push({ path: '/auth/check-email', query: { email: email.value, from: 'login' } })
  }
  else {
    useToastify(result.message || 'Failed to send magic link', { type: 'error' })
  }
}
</script>

<template>
  <div class="w-full max-w-md">
    <div class="bg-card border border-border rounded-lg p-8">
      <h1 class="text-2xl font-bold text-foreground mb-2 text-center">
        Sign in
      </h1>
      <p class="text-muted-foreground mb-8 text-center">
        I'll send you a magic link
      </p>

      <form class="space-y-4" @submit.prevent="handleLogin">
        <div class="space-y-2">
          <label for="email" class="text-sm font-medium text-foreground">
            Email
          </label>
          <Input
            id="email"
            v-model="email"
            type="email"
            placeholder="you@example.com"
            required
            :disabled="isLoading"
          />
        </div>

        <Button type="submit" variant="default" size="lg" class="w-full" :disabled="isLoading">
          <Icon v-if="isLoading" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
          {{ isLoading ? 'Sending...' : 'Send magic link →' }}
        </Button>
      </form>

      <p class="text-sm text-muted-foreground mt-6 text-center">
        Don't have an account?
        <NuxtLink to="/auth/register" class="text-primary hover:underline">
          Register
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
