<script setup lang="ts">
import { AlertCircle, RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'
import { ref, onMounted, computed } from 'vue'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

type DayData = {
  date: string
  total: number
  articles: number
  youtube: number
}

const data = ref<DayData[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const isRetrying = ref(false)

const fetchData = async (showRetryLoading = true) => {
  try {
    if (showRetryLoading) {
      isRetrying.value = true
      error.value = null
    }
    const res = await $fetch<{ chartData: Array<{ date: string; total: number; articles: number; youtube: number }> }>('/api/admin/charts/summaries-time-series')

    // Reverse to show latest date first
    data.value = res.chartData.map((d) => ({
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      total: d.total,
      articles: d.articles,
      youtube: d.youtube,
    })).reverse()
  } catch {
    error.value = 'Failed to load data'
  } finally {
    isLoading.value = false
    isRetrying.value = false
  }
}

const retry = () => fetchData(true)

onMounted(() => fetchData(false))

// Calculate trend for the row
const getTrend = (current: number, previous: number | undefined) => {
  if (!previous) return 'neutral'
  if (current > previous) return 'up'
  if (current < previous) return 'down'
  return 'neutral'
}

const maxTotal = computed(() => Math.max(...data.value.map(d => d.total), 1))
</script>

<template>
  <div class="h-[300px] w-full overflow-auto">
    <!-- Loading skeleton -->
    <div v-if="isLoading && !isRetrying" class="space-y-3 p-2">
      <div v-for="i in 5" :key="i" class="space-y-1">
        <Skeleton class="h-4 w-16" />
        <Skeleton class="h-2 w-full" />
      </div>
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

    <!-- Simple table with Progress bars -->
    <div v-else class="space-y-3 p-2">
      <div
        v-for="(day, index) in data"
        :key="day.date"
        class="space-y-1"
      >
        <div class="flex items-center justify-between text-sm">
          <span class="text-muted-foreground">{{ day.date }}</span>
          <div class="flex items-center gap-2">
            <span class="font-medium">{{ day.total }}</span>
            <TrendingUp v-if="getTrend(day.total, data[index - 1]?.total) === 'up'" class="h-3 w-3 text-green-500" />
            <TrendingDown v-else-if="getTrend(day.total, data[index - 1]?.total) === 'down'" class="h-3 w-3 text-red-500" />
            <Minus v-else class="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
        <Progress :model-value="(day.total / maxTotal) * 100" />
      </div>
    </div>
  </div>
</template>
