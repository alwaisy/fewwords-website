<script setup lang="ts">
import { ExternalLink } from "lucide-vue-next";
import { computed } from "vue";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Article, Summary, YouTube } from "~~/db/schema";

const props = defineProps<{
  summary: Summary & {
    youtube?: YouTube | null;
    article?: Article | null;
  };
  open: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
});

// Extract domain from source
const domain = computed(() => {
  try {
    const url = new URL(props.summary.source);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return props.summary.source.replace(/^https?:\/\/(www\.)?/, "");
  }
});

// Holistic token breakdown
const totalTokens = computed(() => {
  let total = props.summary.totalTokens || 0;

  // Add classifier tokens from YouTube or Article
  if (props.summary.youtube?.classifierTotalTokens) {
    total += props.summary.youtube.classifierTotalTokens;
  }
  if (props.summary.article?.classifierTotalTokens) {
    total += props.summary.article.classifierTotalTokens;
  }

  // Add reasoning tokens from summaries table
  if (props.summary.reasoningTokens) {
    total += props.summary.reasoningTokens;
  }

  return total;
});

const tokenBreakdown = computed(() => {
  const breakdown: {
    stage: string;
    prompt?: number;
    completion?: number;
    reasoning?: number;
    total: number;
  }[] = [];

  // Main summarization stage
  if (props.summary.totalTokens) {
    breakdown.push({
      stage: "Summarization",
      prompt: props.summary.promptTokens || undefined,
      completion: props.summary.completionTokens || undefined,
      reasoning: props.summary.reasoningTokens || undefined,
      total: props.summary.totalTokens,
    });
  }

  // Classification stage (YouTube)
  if (props.summary.youtube?.classifierTotalTokens) {
    breakdown.push({
      stage: "Classification (YouTube)",
      prompt: props.summary.youtube.classifierPromptTokens || undefined,
      completion: props.summary.youtube.classifierCompletionTokens || undefined,
      reasoning: props.summary.youtube.classifierReasoningTokens || undefined,
      total: props.summary.youtube.classifierTotalTokens,
    });
  }

  // Classification stage (Article)
  if (props.summary.article?.classifierTotalTokens) {
    breakdown.push({
      stage: "Classification (Article)",
      prompt: props.summary.article.classifierPromptTokens || undefined,
      completion: props.summary.article.classifierCompletionTokens || undefined,
      total: props.summary.article.classifierTotalTokens,
    });
  }

  return breakdown;
});

// Holistic time breakdown
const totalTimeMs = computed(() => {
  let total = props.summary.responseTimeMs || 0;

  if (props.summary.youtube?.classifierTimeMs) {
    total += props.summary.youtube.classifierTimeMs;
  }
  if (props.summary.article?.classifierTimeMs) {
    total += props.summary.article.classifierTimeMs;
  }

  return total;
});

const formatTime = (ms: number) => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 1000 / 60).toFixed(2)}m`;
};

const timeBreakdown = computed(() => {
  const breakdown: { stage: string; time: number }[] = [];

  // Main summarization time (if responseTimeMs exists and we have classifier time, subtract classifier time)
  if (props.summary.responseTimeMs) {
    let mainTime = props.summary.responseTimeMs;

    // If we have classifier time, subtract it from responseTimeMs to get actual summarization time
    if (props.summary.youtube?.classifierTimeMs) {
      mainTime -= props.summary.youtube.classifierTimeMs;
      breakdown.push({
        stage: "Classification (YouTube)",
        time: props.summary.youtube.classifierTimeMs,
      });
    }
    if (props.summary.article?.classifierTimeMs) {
      mainTime -= props.summary.article.classifierTimeMs;
      breakdown.push({
        stage: "Classification (Article)",
        time: props.summary.article.classifierTimeMs,
      });
    }

    if (mainTime > 0) {
      breakdown.push({
        stage: "Summarization",
        time: mainTime,
      });
    }
  }

  return breakdown;
});
</script>

<template>
  <Drawer v-model:open="isOpen">
    <DrawerContent class="w-full max-w-4xl h-full flex flex-col">
      <DrawerHeader>
        <DrawerTitle class="text-lg">{{
          summary.title || "Untitled"
        }}</DrawerTitle>
        <DrawerDescription class="text-sm text-muted-foreground">
          {{ summary.summaryId }}
        </DrawerDescription>
      </DrawerHeader>

      <div class="flex-1 overflow-y-auto px-4 min-h-0">
        <div class="space-y-6 pb-6">
        <!-- Metadata -->
        <div class="space-y-3">
          <h3 class="text-sm font-medium">Metadata</h3>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-muted-foreground">Type</span>
              <div class="mt-1">
                <Badge
                  :variant="
                    summary.essence === 'article'
                      ? 'default'
                      : summary.essence === 'youtube'
                        ? 'secondary'
                        : 'outline'
                  "
                >
                  {{
                    summary.essence.charAt(0).toUpperCase() +
                    summary.essence.slice(1)
                  }}
                </Badge>
              </div>
            </div>
            <div>
              <span class="text-muted-foreground">Status</span>
              <div class="mt-1">
                <Badge
                  :variant="
                    summary.status === 'completed'
                      ? 'default'
                      : summary.status === 'failed'
                        ? 'destructive'
                        : summary.status === 'processing'
                          ? 'secondary'
                          : 'outline'
                  "
                >
                  {{
                    summary.status.charAt(0).toUpperCase() +
                    summary.status.slice(1)
                  }}
                </Badge>
              </div>
            </div>
            <div>
              <span class="text-muted-foreground">Source</span>
              <div class="mt-1 flex items-center gap-1">
                <a
                  :href="summary.source"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-foreground hover:underline truncate"
                >
                  {{ domain }}
                </a>
                <ExternalLink
                  class="h-3 w-3 flex-shrink-0 text-muted-foreground"
                />
              </div>
            </div>
            <div v-if="summary.model">
              <span class="text-muted-foreground">Model</span>
              <div class="mt-1 truncate">{{ summary.model }}</div>
            </div>
          </div>
        </div>

        <!-- Holistic Token Breakdown -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium">Total Tokens</h3>
            <span class="text-lg font-mono font-semibold">{{
              totalTokens.toLocaleString()
            }}</span>
          </div>

          <!-- Detailed breakdown by stage -->
          <div class="space-y-2 text-sm">
            <div
              v-for="stage in tokenBreakdown"
              :key="stage.stage"
              class="border-l-2 border-muted-foreground/30 pl-3 py-1"
            >
              <div class="font-medium text-muted-foreground mb-1">
                {{ stage.stage }}
              </div>
              <div class="flex gap-4 text-muted-foreground">
                <span v-if="stage.prompt">Prompt: {{ stage.prompt.toLocaleString() }}</span>
                <span v-if="stage.reasoning">Reasoning: {{ stage.reasoning.toLocaleString() }}</span>
                <span v-if="stage.completion">Completion: {{ stage.completion.toLocaleString() }}</span>
                <span class="ml-auto font-medium text-foreground">
                  {{ stage.total.toLocaleString() }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Holistic Time Breakdown -->
        <div v-if="totalTimeMs > 0" class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium">Total Time</h3>
            <span class="text-lg font-mono font-semibold">{{
              formatTime(totalTimeMs)
            }}</span>
          </div>

          <!-- Detailed breakdown by stage -->
          <div class="space-y-2 text-sm">
            <div
              v-for="stage in timeBreakdown"
              :key="stage.stage"
              class="border-l-2 border-muted-foreground/30 pl-3 py-1"
            >
              <div class="flex justify-between">
                <span class="text-muted-foreground">{{ stage.stage }}</span>
                <span class="font-medium text-foreground">{{
                  formatTime(stage.time)
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Video/Article specific metadata -->
        <div v-if="summary.youtube?.duration || summary.article?.wordCount" class="space-y-3">
          <h3 class="text-sm font-medium">Content Details</h3>
          <div class="text-sm text-muted-foreground space-y-1">
            <div v-if="summary.youtube?.duration">
              Duration: {{ Number(summary.youtube.duration).toFixed(1) }} minutes
            </div>
            <div v-if="summary.article?.wordCount">
              Word Count: {{ summary.article.wordCount.toLocaleString() }}
            </div>
            <div v-if="summary.article?.readingTimeMinutes">
              Reading Time: {{ summary.article.readingTimeMinutes }} minutes
            </div>
            <div v-if="summary.youtube?.category">
              Category: {{ summary.youtube.category }}
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div v-if="summary.summary" class="space-y-3">
          <h3 class="text-sm font-medium">Summary</h3>
          <div class="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md">
            {{ summary.summary }}
          </div>
        </div>

        <!-- Reasoning -->
        <div v-if="summary.reasoning" class="space-y-3">
          <h3 class="text-sm font-medium">Classification Reasoning</h3>
          <div class="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded-md">
            {{ summary.reasoning }}
          </div>
        </div>

        <!-- Classifier Details -->
        <div v-if="summary.youtube?.classifierModel || summary.article?.classifierModel" class="space-y-3">
          <h3 class="text-sm font-medium">Classifier Details</h3>
          <div class="text-sm space-y-2">
            <div v-if="summary.youtube?.classifierModel" class="flex justify-between">
              <span class="text-muted-foreground">Model</span>
              <span class="font-mono">{{ summary.youtube.classifierModel }}</span>
            </div>
            <div v-if="summary.article?.classifierModel" class="flex justify-between">
              <span class="text-muted-foreground">Model</span>
              <span class="font-mono">{{ summary.article.classifierModel }}</span>
            </div>
            <div v-if="summary.youtube?.classifierReasoningEffort" class="flex justify-between">
              <span class="text-muted-foreground">Reasoning Effort</span>
              <span class="font-medium">{{ summary.youtube.classifierReasoningEffort }}</span>
            </div>
            <div v-if="summary.youtube?.category" class="flex justify-between">
              <span class="text-muted-foreground">Category</span>
              <span class="font-medium">{{ summary.youtube.category }}</span>
            </div>
            <div v-if="summary.youtube?.cleanTitle" class="flex justify-between">
              <span class="text-muted-foreground">Clean Title</span>
              <span class="font-medium truncate ml-4 max-w-[200px]">{{ summary.youtube.cleanTitle }}</span>
            </div>
            <div v-if="summary.youtube?.isWorthIt !== undefined" class="flex justify-between">
              <span class="text-muted-foreground">Worth Watching</span>
              <span :class="summary.youtube.isWorthIt ? 'text-green-600' : 'text-red-600'" class="font-medium">
                {{ summary.youtube.isWorthIt ? 'Yes' : 'No' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Timestamps -->
        <div class="space-y-3">
          <h3 class="text-sm font-medium">Timestamps</h3>
          <div class="text-sm text-muted-foreground space-y-1">
            <div>
              Created: {{ new Date(summary.createdAt).toLocaleString() }}
            </div>
            <div v-if="summary.completedAt">
              Completed: {{ new Date(summary.completedAt).toLocaleString() }}
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="summary.errorMessage" class="space-y-3">
          <h3 class="text-sm font-medium text-destructive">Error</h3>
          <div class="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {{ summary.errorMessage }}
          </div>
        </div>
        </div>
      </div>

      <DrawerFooter class="shrink-0 px-4 pb-6">
        <Button
          variant="outline"
          as="a"
          :href="`/app/${summary.summaryId}`"
          target="_blank"
        >
          <ExternalLink class="mr-2 h-4 w-4" />
          Open in App
        </Button>
        <DrawerClose as-child>
          <Button variant="ghost">Close</Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
