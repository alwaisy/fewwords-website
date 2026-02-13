<script setup lang="ts">
import { ref, onMounted } from 'vue'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

type ModelStat = {
  model: string | null
  count: number
}

const summaryModels = ref<(ModelStat & { model: string })[]>([])
const articleClassifierModels = ref<(ModelStat & { model: string })[]>([])
const youtubeClassifierModels = ref<(ModelStat & { model: string })[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const fetchData = async () => {
  try {
    const res = await $fetch('/api/admin/stats')
    summaryModels.value = res.modelStats.summaryModels.filter(m => m.model != null) as (ModelStat & { model: string })[]
    articleClassifierModels.value = res.modelStats.articleClassifierModels.filter(m => m.model != null) as (ModelStat & { model: string })[]
    youtubeClassifierModels.value = res.modelStats.youtubeClassifierModels.filter(m => m.model != null) as (ModelStat & { model: string })[]
  } catch (e) {
    console.error('Failed to fetch model stats:', e)
    error.value = 'Failed to load model data'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => fetchData())
</script>

<template>
  <div class="space-y-4">
    <!-- Summary Models Card -->
    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-base">Summary Models</CardTitle>
        <CardDescription>Models used for generating summaries</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="isLoading" class="space-y-2">
          <Skeleton v-for="i in 2" :key="i" class="h-8 w-full" />
        </div>
        <div v-else-if="summaryModels.length === 0" class="text-sm text-muted-foreground py-2">
          No data available
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="stat in summaryModels"
            :key="stat.model"
            class="flex items-center justify-between rounded-lg border px-3 py-2"
          >
            <span class="text-sm font-mono">{{ stat.model }}</span>
            <span class="text-sm text-muted-foreground">{{ stat.count }}</span>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Classifier Models Card -->
    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-base">Classifier Models</CardTitle>
        <CardDescription>Models used for content classification</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="isLoading" class="space-y-2">
          <Skeleton v-for="i in 2" :key="i" class="h-8 w-full" />
        </div>
        <div v-else-if="articleClassifierModels.length === 0 && youtubeClassifierModels.length === 0" class="text-sm text-muted-foreground py-2">
          No data available
        </div>
        <div v-else class="space-y-3">
          <!-- Article Classifiers -->
          <div v-if="articleClassifierModels.length > 0">
            <p class="mb-2 text-xs font-semibold text-muted-foreground uppercase">Articles</p>
            <div class="space-y-2">
              <div
                v-for="stat in articleClassifierModels"
                :key="'article-' + stat.model"
                class="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <span class="text-sm font-mono">{{ stat.model }}</span>
                <span class="text-sm text-muted-foreground">{{ stat.count }}</span>
              </div>
            </div>
          </div>

          <!-- YouTube Classifiers -->
          <div v-if="youtubeClassifierModels.length > 0">
            <p class="mb-2 text-xs font-semibold text-muted-foreground uppercase">YouTube</p>
            <div class="space-y-2">
              <div
                v-for="stat in youtubeClassifierModels"
                :key="'youtube-' + stat.model"
                class="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <span class="text-sm font-mono">{{ stat.model }}</span>
                <span class="text-sm text-muted-foreground">{{ stat.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
