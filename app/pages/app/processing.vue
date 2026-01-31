<script setup lang="ts">
useHead({
  title: 'Processing - Fewwords',
  titleTemplate: null
})

const route = useRoute()
const router = useRouter()
const url = route.query.url as string

interface SummarizeResponse {
  summaryId: string
  url: string
  type: string
  title?: string
  summary: string
  model: string
}

// Steps for processing
type StepStatus = 'pending' | 'active' | 'complete'
const steps = ref([
  { id: 1, label: 'Fetching content...', status: 'pending' as StepStatus },
  { id: 2, label: 'Analyzing with AI...', status: 'pending' as StepStatus },
  { id: 3, label: 'Generating summary...', status: 'pending' as StepStatus },
])

const currentStep = ref(0)
const error = ref<string | null>(null)

onMounted(async () => {
  if (!url) {
    error.value = 'No URL provided'
    return
  }

  try {
    // Step 1: Fetching
    if (steps.value[0]) steps.value[0].status = 'active'
    currentStep.value = 0

    // Call the summarize API
    const response = await $fetch<SummarizeResponse>('/api/summarize', {
      method: 'POST',
      body: { url }
    })

    if (steps.value[0]) steps.value[0].status = 'complete'

    // Step 2: Analyzing
    if (steps.value[1]) steps.value[1].status = 'active'
    currentStep.value = 1
    await sleep(1000)
    if (steps.value[1]) steps.value[1].status = 'complete'

    // Step 3: Generating
    if (steps.value[2]) steps.value[2].status = 'active'
    currentStep.value = 2
    await sleep(800)
    if (steps.value[2]) steps.value[2].status = 'complete'

    // Get summaryId and redirect
    if (response?.summaryId) {
      await router.push(`/app/${response.summaryId}`)
    } else {
      error.value = 'Failed to generate summary'
    }
  } catch (err) {
    console.error('Processing error:', err)
    error.value = err instanceof Error ? err.message : 'Failed to process URL'
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
            This usually takes about 15-20 seconds
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
