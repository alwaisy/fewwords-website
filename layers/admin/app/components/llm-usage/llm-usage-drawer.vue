<script setup lang="ts">
import { computed } from "vue";
import type { FlattenedLlmUsage } from "~~/server/lib/admin";
import { formatNumber, formatTime } from "../../lib/formatters";

const props = defineProps<{
  llmUsage: FlattenedLlmUsage;
  open: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
});

const isYoutube = computed(() => props.llmUsage.essence === 'youtube');
const isArticle = computed(() => props.llmUsage.essence === 'article');
</script>

<template>
  <Drawer v-model:open="isOpen">
    <DrawerContent class="w-full max-w-2xl h-full flex flex-col">
      <DrawerHeader>
        <DrawerTitle class="font-mono">{{ llmUsage.summaryId }}</DrawerTitle>
        <DrawerDescription>
          Detailed LLM usage for a
          <span class="capitalize font-medium">{{ llmUsage.essence }}</span> summary.
        </DrawerDescription>
      </DrawerHeader>

      <div class="flex-1 overflow-y-auto px-4 min-h-0">
        <div class="space-y-6 pb-6">
          <!-- Holistic Stats -->
          <div class="space-y-3">
            <h3 class="text-sm font-medium">Holistic Stats</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-muted-foreground">Total Tokens</span>
                <div class="mt-1 font-mono text-base font-semibold">
                  {{ formatNumber(llmUsage.holisticTotalTokens) }}
                </div>
              </div>
              <div v-if="isYoutube || isArticle">
                <span class="text-muted-foreground">Total Cycle Time</span>
                <div class="mt-1 font-mono text-base font-semibold">
                  {{ formatTime(llmUsage.totalTimeMs) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Summary Stage -->
          <div class="space-y-3">
            <h3 class="text-sm font-medium">Summarization Stage</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-muted-foreground">Model</span>
                <div class="mt-1 font-mono">{{ llmUsage.summaryModel || 'N/A' }}</div>
              </div>
              <div>
                <span class="text-muted-foreground">Prompt ID</span>
                <div class="mt-1 font-mono text-xs">{{ llmUsage.summaryPromptId || 'N/A' }}</div>
              </div>
              <div>
                <span class="text-muted-foreground">Time</span>
                <div class="mt-1 font-mono">{{ formatTime(llmUsage.summaryTimeMs) }}</div>
              </div>
              <div>
                <span class="text-muted-foreground">Total Tokens</span>
                <div class="mt-1 font-mono">{{ formatNumber(llmUsage.summaryTotalTokens) }}</div>
              </div>
              <div>
                <span class="text-muted-foreground">Prompt Tokens</span>
                <div class="mt-1 font-mono">{{ formatNumber(llmUsage.summaryPromptTokens) }}</div>
              </div>
              <div>
                <span class="text-muted-foreground">Completion Tokens</span>
                <div class="mt-1 font-mono">{{ formatNumber(llmUsage.summaryCompletionTokens) }}</div>
              </div>
            </div>
          </div>

          <!-- Classifier Stage -->
          <div v-if="isYoutube || isArticle" class="space-y-3">
            <h3 class="text-sm font-medium">Classification Stage</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-muted-foreground">Model</span>
                <div class="mt-1 font-mono">{{ llmUsage.classifierModel || 'N/A' }}</div>
              </div>
               <div>
                <span class="text-muted-foreground">Time</span>
                <div class="mt-1 font-mono">{{ formatTime(llmUsage.classifierTimeMs) }}</div>
              </div>
              <div>
                <span class="text-muted-foreground">Total Tokens</span>
                <div class="mt-1 font-mono">{{ formatNumber(llmUsage.classifierTotalTokens) }}</div>
              </div>
              <div>
                <span class="text-muted-foreground">Prompt Tokens</span>
                <div class="mt-1 font-mono">{{ formatNumber(llmUsage.classifierPromptTokens) }}</div>
              </div>
              <div>
                <span class="text-muted-foreground">Completion Tokens</span>
                <div class="mt-1 font-mono">{{ formatNumber(llmUsage.classifierCompletionTokens) }}</div>
              </div>
            </div>
          </div>

          <!-- Transcript Stage -->
          <div v-if="isYoutube" class="space-y-3">
            <h3 class="text-sm font-medium">Transcript Stage</h3>
             <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-muted-foreground">Model</span>
                <div class="mt-1 font-mono">{{ llmUsage.transcriptModel || 'N/A' }}</div>
              </div>
               <div>
                <span class="text-muted-foreground">Time</span>
                <div class="mt-1 font-mono">{{ formatTime(llmUsage.transcriptTimeMs) }}</div>
              </div>
              <div>
                <span class="text-muted-foreground">Total Tokens</span>
                <div class="mt-1 font-mono">{{ formatNumber(llmUsage.transcriptTotalTokens) }}</div>
              </div>
              <div>
                <span class="text-muted-foreground">Prompt Tokens</span>
                <div class="mt-1 font-mono">{{ formatNumber(llmUsage.transcriptPromptTokens) }}</div>
              </div>
              <div>
                <span class="text-muted-foreground">Completion Tokens</span>
                <div class="mt-1 font-mono">{{ formatNumber(llmUsage.transcriptCompletionTokens) }}</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <DrawerFooter class="shrink-0 px-4 pb-6">
        <DrawerClose as-child>
          <Button variant="outline">Close</Button>
        </DrawerClose>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
