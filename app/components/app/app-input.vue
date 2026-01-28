<script setup lang="ts">
const router = useRouter()
const inputUrl = ref('')

function handleSubmit() {
  if (!inputUrl.value) return

  // Redirect to processing page with URL
  router.push({
    path: '/app/processing',
    query: { url: inputUrl.value }
  })
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
