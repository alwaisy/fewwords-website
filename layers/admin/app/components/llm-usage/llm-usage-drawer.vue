<script setup lang="ts">
import { computed } from "vue";

import { formatNumber, formatTime } from "../../lib/formatters";

import { countWords } from "~/lib/utils";
import type { FlattenedLlmUsage } from "~~/server/lib/admin";

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

const summaryWordCount = computed(() => countWords(props.llmUsage.summary));

// Dynamic timeline steps to ensure sequential numbering (1, 2, 3...)
const timelineSteps = computed(() => {
  const steps = [];
  
  if (props.llmUsage.transcriptTimeMs) {
    steps.push({ label: 'Transcript Extraction', value: props.llmUsage.transcriptTimeMs });
  }
  
  if (props.llmUsage.classifierTimeMs) {
    steps.push({ label: 'AI Classification', value: props.llmUsage.classifierTimeMs });
  }
  
  if (props.llmUsage.actualSummarizationTimeMs) {
    steps.push({ label: 'AI Summarization', value: props.llmUsage.actualSummarizationTimeMs });
  }
  
  return steps;
});
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
          <!-- Usage Overview -->
          <div class="space-y-4">
            <h3 class="text-sm font-medium">Usage Overview</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-mono">
              <div>
                <span class="text-muted-foreground block mb-1 uppercase text-[10px]">Total Tokens</span>
                <div class="text-base font-semibold">{{ formatNumber(llmUsage.holisticTotalTokens) }}</div>
              </div>
              <div>
                <span class="text-muted-foreground block mb-1 uppercase text-[10px]">Output Words</span>
                <div class="text-base font-semibold">{{ summaryWordCount.toLocaleString() }}</div>
              </div>
               <div v-if="llmUsage.totalTimeMs">
                <span class="text-muted-foreground block mb-1 uppercase text-[10px]">Total Wait</span>
                <div class="text-base font-semibold">{{ formatTime(llmUsage.totalTimeMs) }}</div>
              </div>
              <div>
                <span class="text-muted-foreground block mb-1 uppercase text-[10px]">Server Time</span>
                <div class="text-base font-semibold">{{ formatTime(llmUsage.summaryTimeMs) }}</div>
              </div>
            </div>
          </div>

          <!-- Processing Timeline -->
          <div v-if="timelineSteps.length > 0" class="space-y-3 p-4 bg-muted/30 rounded-lg border">
             <h3 class="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Processing Timeline</h3>
             <div class="space-y-3">
                <div v-for="(step, index) in timelineSteps" :key="index" class="flex items-center justify-between text-xs font-mono">
                  <div class="flex items-center gap-2">
                    <span class="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[8px] font-bold">{{ index + 1 }}</span>
                    <span class="text-muted-foreground">{{ step.label }}</span>
                  </div>
                  <span class="font-bold text-foreground">{{ formatTime(step.value) }}</span>
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
                <span class="text-muted-foreground">Actual AI Time</span>
                <div class="mt-1 font-mono font-semibold">{{ formatTime(llmUsage.actualSummarizationTimeMs) }}</div>
              </div>
              <div>
                <span class="text-muted-foreground">Prompt ID</span>
                <div class="mt-1 font-mono text-xs">{{ llmUsage.summaryPromptId || 'N/A' }}</div>
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
