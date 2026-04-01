<script setup lang="ts">
useHead({
  title: 'Clear Your Tabs - Fewwords',
  titleTemplate: null
})

const { canProceed, refresh: refreshQuota } = useQuota()

// After a summary is created, refresh quota
const handleSubmitted = () => {
  refreshQuota()
}
</script>

<template>
  <main class="flex-1 flex items-center justify-center px-4 min-h-[calc(100vh-186px)]">
    <div class="w-full max-w-2xl">
      <QuotaGate v-if="!canProceed" />
      <AppInput v-else @submitted="handleSubmitted" />
    </div>
  </main>
</template>
