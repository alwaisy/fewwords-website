<script setup lang="ts">
const router = useRouter()
const inputUrl = ref('')

interface CreatePendingResponse {
  summaryId: string
}

async function handleSubmit() {
  if (!inputUrl.value) return

  try {
    // Create pending record
    const response = await $fetch<CreatePendingResponse>('/api/summarize/create-pending', {
      method: 'POST',
      body: { url: inputUrl.value }
    })

    if (response?.summaryId) {
      await router.replace(`/app/${response.summaryId}`)
    }
  } catch {
    // TODO: Show error to user
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
        required
      />
      <Button type="submit" variant="default" size="lg" class="text-lg whitespace-nowrap">
        Go
      </Button>
    </form>
  </div>
</template>
