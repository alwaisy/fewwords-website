<script setup lang="ts">
useHead({
  title: 'Register - Fewwords',
  titleTemplate: null
})

definePageMeta({
  layout: 'auth'
})

const name = ref('')
const username = ref('')
const email = ref('')

const router = useRouter()

function handleRegister() {
  // TODO: Implement register logic + send email
  // For now, just navigate to check-email page
  router.push({ path: '/auth/check-email', query: { email: email.value, from: 'register' } })
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
          />
        </div>

        <Button type="submit" variant="default" size="lg" class="w-full">
          Send verification link →
        </Button>

        <Button
          variant="ghost"
          size="lg"
          class="w-full"
          as-child
        >
          <NuxtLink to="/auth/login">
            Sign in instead
          </NuxtLink>
        </Button>
      </form>
    </div>
  </div>
</template>
