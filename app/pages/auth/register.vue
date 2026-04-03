<script setup lang="ts">
useSeoMeta({
  title: "Register - Fewwords",
  titleTemplate: null,
  robots: { index: false, follow: false },
});

definePageMeta({
  layout: 'auth'
})

const name = ref('')
const username = ref('')
const email = ref('')

const router = useRouter()
const { register, isLoading } = useAuth()

async function handleRegister() {
  if (!name.value || !username.value || !email.value) return

  const result = await register(email.value, name.value, username.value)

  if (result.success) {
    useToastify(result.message || 'Account created! Check your email.', { type: 'success' })
    router.push({ path: '/auth/verify', query: { email: email.value } })
  }
  else {
    useToastify(result.message || 'Failed to create account', { type: 'error' })
  }
}
</script>

<template>
  <div class="w-full max-w-md">
    <div class="bg-card border border-border rounded-lg p-8">
      <h1 class="text-2xl font-bold text-foreground mb-2 text-center">
        Create your account
      </h1>
      <p class="text-muted-foreground mb-8 text-center">
        Time to fix your browser
      </p>

      <form class="space-y-4" @submit.prevent="handleRegister">
        <div class="space-y-2">
          <label for="name" class="text-sm font-medium text-foreground">
            Display name
          </label>
          <Input
            id="name"
            v-model="name"
            type="text"
            placeholder="Trump, not Donald"
            required
            :disabled="isLoading"
          />
          <p class="text-xs text-muted-foreground">
            How your friends call you
          </p>
        </div>

        <div class="space-y-2">
          <label for="username" class="text-sm font-medium text-foreground">
            Username
          </label>
          <Input
            id="username"
            v-model="username"
            type="text"
            placeholder="johndoe"
            required
            :disabled="isLoading"
          />
        </div>

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
          {{ isLoading ? 'Creating...' : 'Send code →' }}
        </Button>

        <Button
          variant="ghost"
          size="lg"
          class="w-full"
          as-child
          :disabled="isLoading"
        >
          <NuxtLink to="/auth/login">
            Sign in instead
          </NuxtLink>
        </Button>
      </form>
    </div>
  </div>
</template>
