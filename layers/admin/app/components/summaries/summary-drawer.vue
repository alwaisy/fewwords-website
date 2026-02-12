<script setup lang="ts">
import { ExternalLink } from "lucide-vue-next";
import { computed } from "vue";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Summary } from "~~/db/schema";

const props = defineProps<{
  summary: Summary & {
    youtube?: {
      videoId?: string | null;
      duration?: number | null;
      category?: string | null;
      cleanTitle?: string | null;
      classifierReasoningTokens?: number | null;
      classifierPromptTokens?: number | null;
      classifierCompletionTokens?: number | null;
      classifierTotalTokens?: number | null;
    } | {
      article?: {
        wordCount?: number | null;
        readingTimeMinutes?: number | null;
        classifierPromptTokens?: number | null;
        classifierCompletionTokens?: number | null;
        classifierTotalTokens?: number | null;
        classifierTimeMs?: number | null;
      }
    } | null;
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
</script>

<template>
  <Drawer v-model:open="isOpen">
    <DrawerContent class="w-full max-w-4xl">
      <DrawerHeader>
        <DrawerTitle class="text-lg">{{
          summary.title || "Untitled"
        }}</DrawerTitle>
        <DrawerDescription class="text-sm text-muted-foreground">
          {{ summary.summaryId }}
        </DrawerDescription>
      </DrawerHeader>

      <div class="space-y-6 px-4">
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

        <!-- Token Usage -->
        <div v-if="summary.totalTokens" class="space-y-3">
          <h3 class="text-sm font-medium">Token Usage</h3>
          <div class="text-sm">
            <span class="text-muted-foreground">Total:</span>
            {{ summary.totalTokens.toLocaleString() }}
            <span v-if="summary.promptTokens" class="ml-3 text-muted-foreground"
              >Prompt:</span
            >
            {{ summary.promptTokens?.toLocaleString() ?? "N/A" }}
            <span
              v-if="summary.completionTokens"
              class="ml-3 text-muted-foreground"
              >Completion:</span
            >
            {{ summary.completionTokens?.toLocaleString() ?? "N/A" }}
          </div>
        </div>

        <!-- Classification Tokens (YouTube/Article specific) -->
        <div
          v-if="summary.youtube?.classifierTotalTokens || summary.article?.classifierTotalTokens"
          class="space-y-3"
        >
          <h3 class="text-sm font-medium">Classification Tokens</h3>
          <div class="text-sm">
            <span class="text-muted-foreground">Total:</span>
            {{
              (summary.youtube?.classifierTotalTokens ||
                summary.article?.classifierTotalTokens
              )?.toLocaleString() ?? "N/A"
            }}
            <span
              v-if="summary.youtube?.classifierPromptTokens || summary.article?.classifierPromptTokens"
              class="ml-3 text-muted-foreground"
              >Prompt:</span
            >
            {{
              (summary.youtube?.classifierPromptTokens ||
                summary.article?.classifierPromptTokens
              )?.toLocaleString() ?? "N/A"
            }}
            <span
              v-if="summary.youtube?.classifierCompletionTokens || summary.article?.classifierCompletionTokens"
              class="ml-3 text-muted-foreground"
              >Completion:</span
            >
            {{
              (summary.youtube?.classifierCompletionTokens ||
                summary.article?.classifierCompletionTokens
              )?.toLocaleString() ?? "N/A"
            }}
          </div>
          <!-- YouTube specific: reasoning tokens -->
          <div v-if="summary.youtube?.classifierReasoningTokens" class="text-sm">
            <span class="text-muted-foreground">Reasoning:</span>
            {{ summary.youtube.classifierReasoningTokens.toLocaleString() }}
          </div>
        </div>

        <!-- Video/Article specific metadata -->
        <div v-if="summary.youtube?.duration || summary.article?.wordCount" class="space-y-3">
          <h3 class="text-sm font-medium">Content Details</h3>
          <div class="text-sm text-muted-foreground space-y-1">
            <div v-if="summary.youtube?.duration">
              Duration: {{ summary.youtube.duration }} minutes
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
          <div class="text-sm whitespace-pre-wrap">{{ summary.summary }}</div>
        </div>

        <!-- Reasoning -->
        <div v-if="summary.reasoning" class="space-y-3">
          <h3 class="text-sm font-medium">Classification Reasoning</h3>
          <div class="text-sm text-muted-foreground whitespace-pre-wrap">
            {{ summary.reasoning }}
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

        <!-- Response Time -->
        <div v-if="summary.responseTimeMs" class="space-y-3">
          <h3 class="text-sm font-medium">Response Time</h3>
          <div class="text-sm">
            {{ (summary.responseTimeMs / 1000).toFixed(2) }} seconds
          </div>
        </div>
      </div>

      <DrawerFooter class="px-4 pb-4">
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
