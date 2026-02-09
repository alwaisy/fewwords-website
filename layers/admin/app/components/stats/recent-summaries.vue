<script setup lang="ts">
import {
  FileText,
  Youtube,
  MessageSquare,
  AlertCircle,
  RefreshCw,
} from "lucide-vue-next";
import { ref, onMounted } from "vue";
import type { Component } from "vue";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type RecentSummary = {
  id: string;
  title: string;
  essence: string;
  status: string;
  createdAt: string;
};

type StatsResponse = {
  recentSummaries: RecentSummary[];
};

const essenceIcons: Record<string, Component> = {
  article: FileText,
  youtube: Youtube,
  reddit: MessageSquare,
};

const statusVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  completed: "default",
  processing: "secondary",
  failed: "destructive",
};

const getStatusVariant = (
  status: string,
): "default" | "secondary" | "destructive" | "outline" => {
  return statusVariants[status] || "default";
};

const recentSummaries = ref<RecentSummary[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const isRetrying = ref(false);

const fetchData = async (showRetryLoading = true) => {
  try {
    if (showRetryLoading) {
      isRetrying.value = true;
      error.value = null;
    }
    const res = await $fetch<StatsResponse>("/api/admin/stats");
    recentSummaries.value = res.recentSummaries;
  } catch (e) {
    console.error("Failed to fetch recent summaries:", e);
    error.value = "Failed to load recent summaries";
  } finally {
    isLoading.value = false;
    isRetrying.value = false;
  }
};

const retry = () => fetchData(true);

onMounted(() => fetchData(false));
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Recent Summaries</CardTitle>
      <CardDescription>
        {{ recentSummaries.length }} most recent summaries
      </CardDescription>
    </CardHeader>
    <CardContent>
      <!-- Loading skeleton -->
      <div v-if="isLoading && !isRetrying" class="space-y-4">
        <div v-for="i in 5" :key="i" class="flex items-center">
          <Skeleton class="h-9 w-9 rounded-lg" />
          <div class="ml-4 space-y-1 flex-1">
            <Skeleton class="h-4 w-32" />
            <Skeleton class="h-3 w-24" />
          </div>
          <Skeleton class="h-6 w-16 rounded-full" />
        </div>
      </div>

      <!-- Error state -->
      <div
        v-else-if="error"
        class="flex flex-col items-center justify-center py-8 text-center"
      >
        <AlertCircle class="mb-2 h-8 w-8 text-destructive" />
        <p class="mb-3 text-sm text-muted-foreground">{{ error }}</p>
        <Button
          size="sm"
          variant="outline"
          :disabled="isRetrying"
          @click="retry"
        >
          <RefreshCw
            :class="{ 'animate-spin': isRetrying }"
            class="mr-2 h-3 w-3"
          />
          Retry
        </Button>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="recentSummaries.length === 0"
        class="flex items-center justify-center py-8 text-muted-foreground"
      >
        <p class="text-sm">No summaries yet</p>
      </div>

      <!-- List -->
      <div v-else class="space-y-4">
        <NuxtLink
          v-for="summary in recentSummaries.slice(0, 5)"
          :key="summary.id"
          :to="`/app/${summary.id}`"
          target="_blank"
          class="flex items-center"
        >
          <div
            class="flex size-9 items-center justify-center rounded-lg bg-muted"
          >
            <component
              :is="essenceIcons[summary.essence] || FileText"
              class="size-4"
            />
          </div>
          <div class="ml-4 space-y-1 flex-1">
            <p
              class="text-sm font-medium leading-none hover:underline cursor-pointer"
            >
              {{ summary.title }}
            </p>
            <p class="text-[0.65rem] text-muted-foreground">
              {{ summary.createdAt }}
            </p>
          </div>
          <div class="ml-auto">
            <Badge :variant="getStatusVariant(summary.status)">
              {{ summary.status }}
            </Badge>
          </div>
        </NuxtLink>
      </div>
    </CardContent>
  </Card>
</template>
