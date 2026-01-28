<script setup lang="ts">
useHead({
  title: 'Processing - Fewwords',
  titleTemplate: null
})

const route = useRoute()
const router = useRouter()
const url = route.query.url as string

// Steps for processing
const steps = [
  { id: 1, label: 'Fetching content...', status: 'pending' },
  { id: 2, label: 'Analyzing with AI...', status: 'pending' },
  { id: 3, label: 'Generating summary...', status: 'pending' },
  { id: 4, label: 'Almost there...', status: 'pending' },
] as const

const currentStep = ref(0)
const error = ref<string | null>(null)

onMounted(async () => {
  if (!url) {
    error.value = 'No URL provided'
    return
  }

  // Simulate processing steps
  // In real app, this would be WebSocket or polling
  const processSteps = async () => {
    // Step 1: Fetching
    steps[0].status = 'active'
    await sleep(2000)
    steps[0].status = 'complete'
    currentStep.value = 1

    // Step 2: Analyzing
    steps[1].status = 'active'
    await sleep(3000)
    steps[1].status = 'complete'
    currentStep.value = 2

    // Step 3: Generating
    steps[2].status = 'active'
    await sleep(2500)
    steps[2].status = 'complete'
    currentStep.value = 3

    // Step 4: Almost done
    steps[3].status = 'active'
    await sleep(1500)
    steps[3].status = 'complete'
    currentStep.value = 4

    // Redirect to summary
    setTimeout(() => {
      router.push('/app/demo-summary')
    }, 500)
  }

  try {
    await processSteps()
  } catch (err) {
    error.value = 'Something went wrong'
  }
})

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function goBack() {
  router.push('/app')
}
</script>

<template>
  <main class="flex-1">
    <section class="py-16 px-4">
      <div class="max-w-md mx-auto text-center">
        <!-- Error State -->
        <div v-if="error" class="bg-destructive/10 border border-destructive/50 rounded-lg p-8">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <Icon name="lucide:alert-circle" class="w-8 h-8 text-destructive" />
          </div>
          <h1 class="text-xl font-bold text-foreground mb-2">
            Oops!
          </h1>
          <p class="text-muted-foreground mb-6">
            {{ error }}
          </p>
          <Button variant="outline" @click="goBack">
            Go back
          </Button>
        </div>

        <!-- Processing State -->
        <div v-else>
          <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon name="lucide:loader-2" class="w-10 h-10 text-primary animate-spin" />
          </div>

          <h1 class="text-2xl font-bold text-foreground mb-2">
            Processing...
          </h1>
          <p class="text-muted-foreground mb-8">
            This usually takes about 30 seconds
          </p>

          <!-- Progress Steps -->
          <div class="text-left space-y-3">
            <div
              v-for="step in steps"
              :key="step.id"
              class="flex items-center gap-3 p-3 rounded-lg transition-colors"
              :class="{
                'bg-primary/10': step.status === 'active',
                'bg-green-500/10': step.status === 'complete'
              }"
            >
              <!-- Icon -->
              <div class="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                <Icon
                  v-if="step.status === 'complete'"
                  name="lucide:check"
                  class="w-5 h-5 text-green-600"
                />
                <Icon
                  v-else-if="step.status === 'active'"
                  name="lucide:loader-2"
                  class="w-5 h-5 text-primary animate-spin"
                />
                <div
                  v-else
                  class="w-5 h-5 rounded-full border-2 border-muted flex items-center justify-center"
                >
                  <div class="w-2 h-2 rounded-full bg-muted-foreground/30" />
                </div>
              </div>

              <!-- Text -->
              <span
                class="text-sm font-medium"
                :class="{
                  'text-foreground': step.status === 'active',
                  'text-green-600': step.status === 'complete',
                  'text-muted-foreground': step.status === 'pending'
                }"
              >
                {{ step.label }}
              </span>
            </div>
          </div>

          <!-- Cancel Button -->
          <Button
            variant="ghost"
            size="sm"
            class="mt-8"
            @click="goBack"
          >
            Cancel
          </Button>
        </div>
      </div>
    </section>
  </main>
</template>
