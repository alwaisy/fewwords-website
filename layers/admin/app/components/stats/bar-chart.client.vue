<script setup lang="ts">
import { VisAxis, VisGroupedBar, VisXYContainer } from '@unovis/vue'
import { AlertCircle, RefreshCw } from 'lucide-vue-next'
import { ref, onMounted } from 'vue'

import { Button } from '@/components/ui/button'

type BarData = {
  essence: string
  count: number
}

type EssenceStat = {
  essence: string
  count: number
  percentage: string
}

type StatsResponse = {
  essenceStats: EssenceStat[]
}

defineProps<{
  config: Record<string, { label: string; color: string }>
}>()

const data = ref<BarData[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const isRetrying = ref(false)

const fetchData = async (showRetryLoading = true) => {
  try {
    if (showRetryLoading) {
      isRetrying.value = true
      error.value = null
    }
    const res = await $fetch<StatsResponse>('/api/admin/stats')
    data.value = res.essenceStats.map(s => ({ essence: s.essence, count: s.count }))
  } catch (e) {
    console.error('Failed to fetch chart data:', e)
    error.value = 'Failed to load chart data'
  } finally {
    isLoading.value = false
    isRetrying.value = false
  }
}

const retry = () => fetchData(true)

onMounted(() => fetchData(false))
</script>

<template>
  <div class="h-[150px] w-full">
    <!-- Loading skeleton -->
    <div v-if="isLoading && !isRetrying" class="h-full w-full space-y-3 p-4">
      <div class="h-4 w-1/3 animate-pulse rounded bg-muted" />
      <div class="h-20 w-full animate-pulse rounded bg-muted" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex h-full flex-col items-center justify-center p-6 text-center">
      <AlertCircle class="mb-2 h-8 w-8 text-destructive" />
      <p class="mb-3 text-sm text-muted-foreground">{{ error }}</p>
      <Button size="sm" variant="outline" :disabled="isRetrying" @click="retry">
        <RefreshCw :class="{ 'animate-spin': isRetrying }" class="mr-2 h-3 w-3" />
        Retry
      </Button>
    </div>

    <!-- Empty state -->
    <div v-else-if="data.length === 0" class="flex h-full items-center justify-center text-muted-foreground">
      <p class="text-sm">No data available</p>
    </div>

    <!-- Chart - Proper Unovis structure with VisXYContainer -->
    <VisXYContainer v-else :data="data" class="h-full w-full">
      <VisGroupedBar
        :x="(d: BarData) => d.essence"
        :y="(d: BarData) => d.count"
        :padding="{ top: 10, right: 10, bottom: 30, left: 40 }"
        color="hsl(var(--primary))"
      />
      <VisAxis
        type="x"
        :grid-line="false"
        :tick-line="false"
        :tick-format="(d: unknown) => String(d).charAt(0).toUpperCase() + String(d).slice(1)"
      />
      <VisAxis
        type="y"
        :grid-line="true"
        :tick-line="false"
      />
    </VisXYContainer>
  </div>
</template>
