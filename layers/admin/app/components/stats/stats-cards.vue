<script setup lang="ts">
import { FileText, Users, Coins, CheckCircle } from 'lucide-vue-next'
import { ref, onMounted } from 'vue'
import type { Component } from 'vue'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

type StatCard = {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: Component
}

type ApiStatCard = Omit<StatCard, 'icon'>

type StatsResponse = {
  statsCards: ApiStatCard[]
}

const emit = defineEmits<{
  dataLoaded: [data: StatCard[]]
}>()

const statsCards = ref<StatCard[]>([])
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

    // Map stats to cards with icons
    statsCards.value = res.statsCards.map((stat) => {
      let icon: Component
      switch (stat.title) {
        case 'Total Summaries':
          icon = FileText
          break
        case 'Total Users':
          icon = Users
          break
        case 'Token Usage':
          icon = Coins
          break
        case 'Success Rate':
          icon = CheckCircle
          break
        default:
          icon = FileText
      }
      return { ...stat, icon }
    })

    emit('dataLoaded', statsCards.value)
  } catch (e) {
    console.error('Failed to fetch stats cards:', e)
    error.value = 'Failed to load stats'
  } finally {
    isLoading.value = false
    isRetrying.value = false
  }
}

const retry = () => fetchData(true)

onMounted(() => fetchData(false))
</script>

<template>
  <!-- Loading skeleton -->
  <div v-if="isLoading && !isRetrying" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <Card v-for="i in 4" :key="i">
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton class="h-4 w-24" />
        <Skeleton class="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton class="h-8 w-20 mb-2" />
        <Skeleton class="h-3 w-full" />
      </CardContent>
    </Card>
  </div>

  <!-- Error state -->
  <Card v-else-if="error" class="border-destructive">
    <CardContent class="flex flex-col items-center justify-center p-6 text-center">
      <p class="text-destructive mb-4">{{ error }}</p>
      <button
        class="text-sm underline hover:text-destructive/80"
        :disabled="isRetrying"
        @click="retry"
      >
        {{ isRetrying ? 'Retrying...' : 'Retry' }}
      </button>
    </CardContent>
  </Card>

  <!-- Stats cards -->
  <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <Card v-for="stat in statsCards" :key="stat.title">
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">
          {{ stat.title }}
        </CardTitle>
        <component :is="stat.icon" class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">{{ stat.value }}</div>
        <p class="text-xs text-muted-foreground">
          {{ stat.change }}
        </p>
      </CardContent>
    </Card>
  </div>
</template>
