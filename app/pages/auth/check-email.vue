<script setup lang="ts">
useHead({
  title: 'Check Your Email - Fewwords',
  titleTemplate: null
})

definePageMeta({
  layout: 'auth'
})

const route = useRoute()
const email = route.query.email as string || 'your email'
const from = route.query.from as string || 'login' // 'register' or 'login'

const isResending = ref(false)
const timeLeft = ref(15 * 60) // 15 minutes in seconds
const router = useRouter()

// Countdown timer
onMounted(() => {
  const timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      clearInterval(timer)
    }
  }, 1000)

  onUnmounted(() => {
    clearInterval(timer)
  })
})

// Format time as MM:SS
const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

async function handleResend() {
  isResending.value = true
  // TODO: Implement resend logic
  setTimeout(() => {
    isResending.value = false
    // Reset timer on resend
    timeLeft.value = 15 * 60
  }, 2000)
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="w-full max-w-md text-center">
    <div class="mb-8">
      <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon name="lucide:mail" class="w-10 h-10 text-primary" />
      </div>
      <h1 class="text-2xl font-bold text-foreground mb-2">
        Check your email
      </h1>
      <p class="text-muted-foreground">
        I sent a magic link to <span class="text-foreground font-medium">{{ email }}</span>
      </p>
    </div>

    <div class="bg-muted/30 border border-border rounded-lg p-6 mb-8">
      <p class="text-sm text-muted-foreground mb-2">
        Link expires in <span class="text-foreground italic">{{ formattedTime }}</span>
      </p>
      <p class="text-sm text-muted-foreground">
        Click the link to sign in
      </p>
    </div>

    <div class="space-y-4">
      <Button
        variant="outline"
        size="lg"
        class="w-full"
        :disabled="isResending"
        @click="handleResend"
      >
        <Icon v-if="isResending" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
        {{ isResending ? 'Sending...' : 'Resend link' }}
      </Button>

      <Button
        v-if="from === 'login'"
        variant="link"
        size="sm"
        @click="goBack"
      >
        Wrong email? Go back
      </Button>

      <Button
        v-if="from === 'register'"
        variant="link"
        size="sm"
        as-child
      >
        <NuxtLink to="/auth/login">
          Have an account? Sign in
        </NuxtLink>
      </Button>
    </div>
  </div>
</template>
