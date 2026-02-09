<script setup lang="ts">
import { AlertCircle, RefreshCw } from 'lucide-vue-next'
import { ref, onMounted } from 'vue'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

type EssenceStat = {
  essence: string
  count: number
  percentage: string
}

type StatsResponse = {
  essenceStats: EssenceStat[]
  totalSummaries?: number
}

const essenceStats = ref<EssenceStat[]>([])
const totalSummaries = ref(0)
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
    essenceStats.value = res.essenceStats
    totalSummaries.value = res.totalSummaries || res.essenceStats.reduce((sum, s) => sum + s.count, 0)
  } catch (e) {
    console.error('Failed to fetch content distribution:', e)
    error.value = 'Failed to load distribution data'
  } finally {
    isLoading.value = false
    isRetrying.value = false
  }
}

const retry = () => fetchData(true)

onMounted(() => fetchData(false))
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Content Distribution</CardTitle>
      <CardDescription>Summaries by content type</CardDescription>
    </CardHeader>
    <CardContent>
      <!-- Loading skeleton -->
      <div v-if="isLoading && !isRetrying" class="space-y-4">
        <div v-for="i in 3" :key="i" class="space-y-2">
          <Skeleton class="h-4 w-20" />
          <Skeleton class="h-2 w-full" />
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle class="mb-2 h-8 w-8 text-destructive" />
        <p class="mb-3 text-sm text-muted-foreground">{{ error }}</p>
        <Button size="sm" variant="outline" :disabled="isRetrying" @click="retry">
          <RefreshCw :class="{ 'animate-spin': isRetrying }" class="mr-2 h-3 w-3" />
          Retry
        </Button>
      </div>

      <!-- Empty state -->
      <div v-else-if="essenceStats.length === 0" class="flex items-center justify-center py-8 text-muted-foreground">
        <p class="text-sm">No data available</p>
      </div>

      <!-- Content with Progress bars -->
      <div v-else class="space-y-4">
        <div
          v-for="stat in essenceStats"
          :key="stat.essence"
          class="space-y-2"
        >
          <div class="flex items-center justify-between text-sm">
            <span class="font-medium capitalize">{{ stat.essence }}</span>
            <span class="text-muted-foreground">{{ stat.count }} ({{ stat.percentage }}%)</span>
          </div>
          <Progress :model-value="parseFloat(stat.percentage)" />
        </div>
      </div>
    </CardContent>
  </Card>
</template>
