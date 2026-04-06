<script setup lang="ts">
useSeoMeta({
  title: "Verify Code - Fewwords",
  titleTemplate: null,
  robots: { index: false, follow: false },
});

definePageMeta({
  layout: 'auth'
})

const router = useRouter()
const route = useRoute()
const { verify, isLoading, login } = useAuth()

const email = route.query.email as string | undefined
const otp = ref('')
const status = ref<'input' | 'loading' | 'success' | 'error'>('input')
const errorMessage = ref('')
const isResending = ref(false)

async function handleSubmit() {
  if (otp.value.length !== 6) return

  status.value = 'loading'
  errorMessage.value = ''

  const result = await verify(otp.value)

  if (result.success && result.user) {
    status.value = 'success'

    // Redirect to app
    setTimeout(() => {
      if (result.user?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/app')
      }
    }, 1500)
  }
  else {
    status.value = 'error'
    errorMessage.value = result.message || 'Invalid or expired code'
    // Reset to input state after showing error
    setTimeout(() => {
      status.value = 'input'
    }, 2000)
  }
}

function goBack() {
  router.push('/auth/login')
}

async function handleResend() {
  if (!email) return

  isResending.value = true

  // Call login API to resend code
  const result = await login(email)

  if (result.success) {
    useToastify('New code sent!', { type: 'success' })
    otp.value = '' // Clear input
    errorMessage.value = ''
  }
  else {
    useToastify(result.message || 'Failed to resend code', { type: 'error' })
  }

  isResending.value = false
}
</script>

<template>
  <div class="w-full max-w-md text-center">
    <!-- Input State -->
    <template v-if="status === 'input'">
      <div class="mb-8">
        <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon name="lucide:key-round" class="w-10 h-10 text-primary" />
        </div>
        <h1 class="text-2xl font-bold text-foreground mb-2">
          Enter your code
        </h1>
        <p class="text-muted-foreground">
          Check your email for a 6-digit code
        </p>
      </div>

      <form class="space-y-6" @submit.prevent="handleSubmit">
        <div class="flex justify-center">
          <InputOTP v-model="otp" :maxlength="6" @complete="handleSubmit">
            <InputOTPGroup>
              <InputOTPSlot :index="0" />
              <InputOTPSlot :index="1" />
              <InputOTPSlot :index="2" />
              <InputOTPSeparator />
              <InputOTPSlot :index="3" />
              <InputOTPSlot :index="4" />
              <InputOTPSlot :index="5" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          type="submit"
          variant="default"
          size="lg"
          class="w-full"
          :disabled="otp.length !== 6"
        >
          Verify
        </Button>

        <Button
          v-umami="'verify-resend-code'"
          type="button"
          variant="ghost"
          size="sm"
          class="w-full"
          :disabled="isResending"
          @click="handleResend"
        >
          <Icon v-if="isResending" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
          {{ isResending ? 'Sending...' : 'Resend code' }}
        </Button>
      </form>

      <Button
        v-umami="'verify-go-back'"
        variant="link"
        size="sm"
        class="mt-4"
        @click="goBack"
      >
        Wrong email? Go back
      </Button>
    </template>

    <!-- Loading State -->
    <template v-else-if="status === 'loading' || isLoading">
      <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon name="lucide:loader-2" class="w-10 h-10 text-primary animate-spin" />
      </div>
      <h1 class="text-2xl font-bold text-foreground mb-2">
        Verifying...
      </h1>
      <p class="text-muted-foreground">
        Hold on, checking your code
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
      <p class="text-muted-foreground">
        Redirecting you to the app...
      </p>
    </template>

    <!-- Error State -->
    <template v-else-if="status === 'error'">
      <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
        <Icon name="lucide:x" class="w-10 h-10 text-destructive" />
      </div>
      <h1 class="text-2xl font-bold text-foreground mb-2">
        Invalid code
      </h1>
      <p class="text-muted-foreground mb-8">
        {{ errorMessage || 'Something went wrong' }}
      </p>

      <div class="space-y-3">
        <Button
          v-umami="'verify-try-again'"
          variant="outline"
          size="lg"
          class="w-full"
          @click="status = 'input'"
        >
          Try again
        </Button>
        <Button
          v-umami="'verify-resend-code-error'"
          variant="ghost"
          size="sm"
          class="w-full"
          :disabled="isResending"
          @click="handleResend"
        >
          <Icon v-if="isResending" name="lucide:loader-2" class="w-4 h-4 mr-2 animate-spin" />
          {{ isResending ? 'Sending...' : 'Resend code' }}
        </Button>
      </div>
    </template>
  </div>
</template>
