<script setup lang="ts">
import { ExternalLink } from "lucide-vue-next";
import { computed } from "vue";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { countWords } from "~/lib/utils";
import type { Article, Summary, YouTube } from "~~/database/orm/schema";
import { parseErrorLog } from "~~/server/lib/errors";

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

// Count words from summary text
const summaryWordCount = computed(() => countWords(props.summary.summary));

// Extract domain from source
const domain = computed(() => {
  try {
    const url = new URL(props.summary.source);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return props.summary.source.replace(/^https?:\/\/(www\.)?/, "");
  }
});

const errorLog = computed(() => parseErrorLog(props.summary.errorMessage));
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
          </div>
        </div>

        <!-- YouTube specific metadata -->
        <div v-if="summary.essence === 'youtube'" class="space-y-3">
          <h3 class="text-sm font-medium">Content Details</h3>
          <div class="text-sm text-muted-foreground space-y-1">
            <div v-if="summary.youtube?.duration">
              Duration: {{ Number(summary.youtube.duration).toFixed(1) }} minutes
            </div>
            <div v-if="summary.youtube?.category">
              Category: {{ summary.youtube.category }}
            </div>
          </div>
        </div>

        <!-- Article specific metadata -->
        <div v-if="summary.essence === 'article'" class="space-y-3">
          <h3 class="text-sm font-medium">Content Details</h3>
          <div class="text-sm text-muted-foreground space-y-1">
            <div v-if="summary.article?.readingTimeMinutes">
              Reading Time: {{ summary.article.readingTimeMinutes }} minutes
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div v-if="summary.summary" class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium">Summary</h3>
            <span class="text-xs text-muted-foreground">
              {{ summaryWordCount.toLocaleString() }} words
            </span>
          </div>
          <div class="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-md">
            {{ summary.summary }}
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

        <!-- Error Log -->
        <div v-if="errorLog.length" class="space-y-3">
          <h3 class="text-sm font-medium text-destructive">
            Errors ({{ errorLog.length }})
          </h3>
          <div
            v-for="(error, i) in errorLog"
            :key="i"
            class="p-3 bg-destructive/10 rounded-md space-y-1"
          >
            <div class="flex items-center gap-2">
              <Badge :variant="error.type === 'email' ? 'secondary' : 'destructive'">
                {{ error.type }}
              </Badge>
              <span v-if="error.retryCount" class="text-xs text-muted-foreground">
                retry #{{ error.retryCount }}
              </span>
            </div>
            <p class="text-sm text-destructive">{{ error.message }}</p>
            <p class="text-xs text-muted-foreground">
              {{ new Date(error.timestamp).toLocaleString() }}
            </p>
            <pre
              v-if="error.raw"
              class="text-xs text-muted-foreground mt-1 p-2 bg-muted rounded overflow-x-auto"
            >{{ error.raw }}</pre>
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
