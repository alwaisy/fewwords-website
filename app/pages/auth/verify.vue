<script setup lang="ts">
useHead({
  title: 'Verifying - Fewwords',
  titleTemplate: null
})

definePageMeta({
  layout: 'auth'
})

const route = useRoute()
const router = useRouter()
const token = route.query.token as string
const { login } = useAuth()

const status = ref<'loading' | 'success' | 'error'>('loading')
const errorMessage = ref('')

onMounted(async () => {
  if (!token) {
    status.value = 'error'
    errorMessage.value = 'Invalid verification link'
    return
  }

  // TODO: Verify token with backend
  // For now, simulate verification
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mock success (in real app, this would be an API call)
    // const response = await $fetch('/api/auth/verify', { method: 'POST', body: { token } })

    // For demo, mark as success
    status.value = 'success'

    // Set auth state
    login()

    // Redirect to app after 2 seconds
    setTimeout(() => {
      router.push('/app')
    }, 2000)
  } catch {
    status.value = 'error'
    errorMessage.value = 'Invalid or expired link'
  }
})

function goToApp() {
  router.push('/app')
}

function goBack() {
  router.push('/auth/login')
}
</script>

<template>
  <div class="w-full max-w-md text-center">
    <!-- Loading State -->
    <template v-if="status === 'loading'">
      <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon name="lucide:loader-2" class="w-10 h-10 text-primary animate-spin" />
      </div>
      <h1 class="text-2xl font-bold text-foreground mb-2">
        Verifying...
      </h1>
      <p class="text-muted-foreground">
        Hold on, I'm checking your link
      </p>
    </template>

    <!-- Success State -->
    <template v-else-if="status === 'success'">
      <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
        <Icon name="lucide:check" class="w-10 h-10 text-green-600" />
      </div>
      <h1 class="text-2xl font-bold text-foreground mb-2">
        You're in!
      </h1>
      <p class="text-muted-foreground mb-8">
        Redirecting you to the app...
      </p>
      <Button
        variant="default"
        size="lg"
        class="w-full"
        @click="goToApp"
      >
        Go to app →
      </Button>
    </template>

    <!-- Error State -->
    <template v-else-if="status === 'error'">
      <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
        <Icon name="lucide:x" class="w-10 h-10 text-destructive" />
      </div>
      <h1 class="text-2xl font-bold text-foreground mb-2">
        Verification failed
      </h1>
      <p class="text-muted-foreground mb-8">
        {{ errorMessage || 'Something went wrong' }}
      </p>
      <div class="space-y-3">
        <Button
          variant="default"
          size="lg"
          class="w-full"
          @click="goBack"
        >
          Try again
        </Button>
        <Button
          variant="link"
          size="sm"
          as-child
        >
          <NuxtLink to="/auth/link-expired">
            Link expired?
          </NuxtLink>
        </Button>
      </div>
    </template>
  </div>
</template>
