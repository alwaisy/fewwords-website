<script setup lang="ts">
import { FileText, Youtube, Clock, Coins, ArrowUp, ArrowDown } from 'lucide-vue-next'
import { ref, onMounted } from 'vue'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

type ContentStats = {
  count: number
  avgTokens: number
  avgTimeMs: number
  minTokens: number
  maxTokens: number
  minTimeMs: number
  maxTimeMs: number
  breakdown: {
    summaryTokens: number
    reasoningTokens: number
    classifierTokens: number
    summaryTimeMs: number
    classifierTimeMs: number
  }
}

type AvgStats = {
  article: ContentStats
  youtube: ContentStats
}

type StatsResponse = {
  avgStats: AvgStats
}

const avgStats = ref<AvgStats | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

const formatTime = (ms: number): string => {
  if (ms >= 60000) {
    return (ms / 60000).toFixed(1) + 'm'
  }
  if (ms >= 1000) {
    return (ms / 1000).toFixed(1) + 's'
  }
  return ms + 'ms'
}

const formatTokens = (tokens: number): string => {
  if (tokens >= 1000) {
    return (tokens / 1000).toFixed(1) + 'K'
  }
  return tokens.toString()
}

const fetchData = async () => {
  try {
    const res = await $fetch<StatsResponse>('/api/admin/stats')
    avgStats.value = res.avgStats
  } catch (e) {
    console.error('Failed to fetch avg stats:', e)
    error.value = 'Failed to load stats'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => fetchData())
</script>

<template>
  <!-- Loading skeleton -->
  <div v-if="isLoading" class="grid gap-4 md:grid-cols-2">
    <Card v-for="i in 2" :key="i">
      <CardHeader>
        <Skeleton class="h-5 w-32" />
        <Skeleton class="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div class="space-y-3">
          <Skeleton class="h-16 w-full" />
          <Skeleton class="h-16 w-full" />
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Error state -->
  <Card v-else-if="error" class="border-destructive">
    <CardContent class="flex flex-col items-center justify-center p-6 text-center">
      <p class="text-destructive">{{ error }}</p>
    </CardContent>
  </Card>

  <!-- Stats cards -->
  <div v-else-if="avgStats" class="grid gap-4 md:grid-cols-2">
    <!-- Article Stats -->
    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="flex items-center gap-2 text-base">
          <FileText class="h-4 w-4" />
          Article Averages
        </CardTitle>
        <CardDescription>
          {{ avgStats.article.count.toLocaleString() }} completed summaries
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- Tokens row -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm">
            <Coins class="h-4 w-4 text-muted-foreground" />
            <span class="text-muted-foreground">Avg Tokens</span>
          </div>
          <span class="text-lg font-mono font-semibold">
            {{ formatTokens(avgStats.article.avgTokens) }}
          </span>
        </div>
        <!-- Token breakdown -->
        <div class="text-xs text-muted-foreground space-y-1 pl-6 border-l-2 border-muted">
          <div class="flex justify-between">
            <span>Summary</span>
            <span class="font-mono">{{ avgStats.article.breakdown.summaryTokens.toLocaleString() }}</span>
          </div>
          <div v-if="avgStats.article.breakdown.reasoningTokens > 0" class="flex justify-between">
            <span>Reasoning</span>
            <span class="font-mono">{{ avgStats.article.breakdown.reasoningTokens.toLocaleString() }}</span>
          </div>
          <div v-if="avgStats.article.breakdown.classifierTokens > 0" class="flex justify-between">
            <span>Classification</span>
            <span class="font-mono">{{ avgStats.article.breakdown.classifierTokens.toLocaleString() }}</span>
          </div>
        </div>
        <!-- Min/Max Tokens -->
        <div class="flex items-center gap-4 text-xs text-muted-foreground">
          <div class="flex items-center gap-1">
            <ArrowDown class="h-3 w-3 text-green-600" />
            <span>Min: <span class="font-mono">{{ avgStats.article.minTokens.toLocaleString() }}</span></span>
          </div>
          <div class="flex items-center gap-1">
            <ArrowUp class="h-3 w-3 text-red-600" />
            <span>Max: <span class="font-mono">{{ avgStats.article.maxTokens.toLocaleString() }}</span></span>
          </div>
        </div>

        <!-- Time row -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm">
            <Clock class="h-4 w-4 text-muted-foreground" />
            <span class="text-muted-foreground">Avg Time</span>
          </div>
          <span class="text-lg font-mono font-semibold">
            {{ formatTime(avgStats.article.avgTimeMs) }}
          </span>
        </div>
        <!-- Time breakdown -->
        <div class="text-xs text-muted-foreground space-y-1 pl-6 border-l-2 border-muted">
          <div class="flex justify-between">
            <span>Summarization</span>
            <span class="font-mono">{{ formatTime(avgStats.article.breakdown.summaryTimeMs) }}</span>
          </div>
          <div v-if="avgStats.article.breakdown.classifierTimeMs > 0" class="flex justify-between">
            <span>Classification</span>
            <span class="font-mono">{{ formatTime(avgStats.article.breakdown.classifierTimeMs) }}</span>
          </div>
        </div>
        <!-- Min/Max Time -->
        <div class="flex items-center gap-4 text-xs text-muted-foreground">
          <div class="flex items-center gap-1">
            <ArrowDown class="h-3 w-3 text-green-600" />
            <span>Min: <span class="font-mono">{{ formatTime(avgStats.article.minTimeMs) }}</span></span>
          </div>
          <div class="flex items-center gap-1">
            <ArrowUp class="h-3 w-3 text-red-600" />
            <span>Max: <span class="font-mono">{{ formatTime(avgStats.article.maxTimeMs) }}</span></span>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- YouTube Stats -->
    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="flex items-center gap-2 text-base">
          <Youtube class="h-4 w-4" />
          YouTube Averages
        </CardTitle>
        <CardDescription>
          {{ avgStats.youtube.count.toLocaleString() }} completed summaries
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- Tokens row -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm">
            <Coins class="h-4 w-4 text-muted-foreground" />
            <span class="text-muted-foreground">Avg Tokens</span>
          </div>
          <span class="text-lg font-mono font-semibold">
            {{ formatTokens(avgStats.youtube.avgTokens) }}
          </span>
        </div>
        <!-- Token breakdown -->
        <div class="text-xs text-muted-foreground space-y-1 pl-6 border-l-2 border-muted">
          <div class="flex justify-between">
            <span>Summary</span>
            <span class="font-mono">{{ avgStats.youtube.breakdown.summaryTokens.toLocaleString() }}</span>
          </div>
          <div v-if="avgStats.youtube.breakdown.reasoningTokens > 0" class="flex justify-between">
            <span>Reasoning</span>
            <span class="font-mono">{{ avgStats.youtube.breakdown.reasoningTokens.toLocaleString() }}</span>
          </div>
          <div v-if="avgStats.youtube.breakdown.classifierTokens > 0" class="flex justify-between">
            <span>Classification</span>
            <span class="font-mono">{{ avgStats.youtube.breakdown.classifierTokens.toLocaleString() }}</span>
          </div>
        </div>
        <!-- Min/Max Tokens -->
        <div class="flex items-center gap-4 text-xs text-muted-foreground">
          <div class="flex items-center gap-1">
            <ArrowDown class="h-3 w-3 text-green-600" />
            <span>Min: <span class="font-mono">{{ avgStats.youtube.minTokens.toLocaleString() }}</span></span>
          </div>
          <div class="flex items-center gap-1">
            <ArrowUp class="h-3 w-3 text-red-600" />
            <span>Max: <span class="font-mono">{{ avgStats.youtube.maxTokens.toLocaleString() }}</span></span>
          </div>
        </div>

        <!-- Time row -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm">
            <Clock class="h-4 w-4 text-muted-foreground" />
            <span class="text-muted-foreground">Avg Time</span>
          </div>
          <span class="text-lg font-mono font-semibold">
            {{ formatTime(avgStats.youtube.avgTimeMs) }}
          </span>
        </div>
        <!-- Time breakdown -->
        <div class="text-xs text-muted-foreground space-y-1 pl-6 border-l-2 border-muted">
          <div class="flex justify-between">
            <span>Summarization</span>
            <span class="font-mono">{{ formatTime(avgStats.youtube.breakdown.summaryTimeMs) }}</span>
          </div>
          <div v-if="avgStats.youtube.breakdown.classifierTimeMs > 0" class="flex justify-between">
            <span>Classification</span>
            <span class="font-mono">{{ formatTime(avgStats.youtube.breakdown.classifierTimeMs) }}</span>
          </div>
        </div>
        <!-- Min/Max Time -->
        <div class="flex items-center gap-4 text-xs text-muted-foreground">
          <div class="flex items-center gap-1">
            <ArrowDown class="h-3 w-3 text-green-600" />
            <span>Min: <span class="font-mono">{{ formatTime(avgStats.youtube.minTimeMs) }}</span></span>
          </div>
          <div class="flex items-center gap-1">
            <ArrowUp class="h-3 w-3 text-red-600" />
            <span>Max: <span class="font-mono">{{ formatTime(avgStats.youtube.maxTimeMs) }}</span></span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
