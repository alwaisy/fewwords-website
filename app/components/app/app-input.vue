<script setup lang="ts">
const router = useRouter()
const inputUrl = ref('')
const isProcessing = ref(false)

interface SummarizeResponse {
  summaryId: string
  url: string
  type: string
  title?: string
  summary: string
  model: string
}

async function handleSubmit() {
  if (!inputUrl.value) return

  isProcessing.value = true

  try {
    // Call API directly and get summaryId
    const response = await $fetch<SummarizeResponse>('/api/summarize', {
      method: 'POST',
      body: { url: inputUrl.value }
    })

    if (response?.summaryId) {
      await router.replace(`/app/${response.summaryId}`)
    }
  } catch (err) {
    console.error('Error:', err)
    // TODO: Show error to user
  } finally {
    isProcessing.value = false
  }
}
</script>

<template>
  <div class="bg-card border border-border rounded-lg p-6">
    <form class="flex gap-3" @submit.prevent="handleSubmit">
      <Input
        v-model="inputUrl"
        type="url"
        placeholder="Paste article or video URL..."
        class="flex-1"
        :disabled="isProcessing"
        required
      />
      <Button
        type="submit"
        variant="default"
        size="lg"
        class="text-lg whitespace-nowrap"
        :disabled="isProcessing"
      >
        <Icon v-if="isProcessing" name="lucide:loader-2" class="w-5 h-5 animate-spin" />
        <span v-else>Go</span>
      </Button>
    </form>
  </div>
</template>
