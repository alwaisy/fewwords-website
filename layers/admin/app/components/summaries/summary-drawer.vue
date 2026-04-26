<script setup lang="ts">
import { Ban, ExternalLink, Eye, EyeOff, Loader2 } from "lucide-vue-next";
import { computed, ref, watch } from "vue";

import { formatTime } from "../../lib/formatters";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { countWords } from "~/lib/utils";
import type { Article, Summary, YouTube } from "~~/database/orm/schema";
import { parseErrorLog } from "~~/server/lib/errors";

const props = defineProps<{
  summary: Summary & {
    youtube?: YouTube | null;
    article?: Article | null;
    user?: {
      id: string;
      email: string;
      name: string;
    } | null;
  };
  open: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  "updated": []; // Added updated event
}>();

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
});

// Moderation state
const isUpdating = ref(false);
const blockReason = ref(props.summary.blockReason || "");
const showBlockInput = ref(false);

// Reset state when summary changes
watch(() => props.summary.id, () => {
  blockReason.value = props.summary.blockReason || "";
  showBlockInput.value = false;
});

const toggleHidden = async () => {
  if (isUpdating.value) return;
  
  isUpdating.value = true;
  try {
    const newHiddenValue = !props.summary.isHidden;
    
    await $fetch(`/api/admin/summaries/${props.summary.id}`, {
      method: "PATCH",
      body: { isHidden: newHiddenValue },
    });
    
    useToastify(newHiddenValue ? "Summary hidden from Explore" : "Summary visible in Explore", { type: "success" });
    emit("updated");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update summary";
    useToastify(message, { type: "error" });
  } finally {
    isUpdating.value = false;
  }
};

const toggleBlocked = async () => {
  if (isUpdating.value) return;

  // If we are currently unblocked and haven't shown the input yet, show it first
  if (!props.summary.isBlocked && !showBlockInput.value) {
    showBlockInput.value = true;
    return;
  }
  
  isUpdating.value = true;
  try {
    const newBlockedValue = !props.summary.isBlocked;
    
    await $fetch(`/api/admin/summaries/${props.summary.id}`, {
      method: "PATCH",
      body: { 
        isBlocked: newBlockedValue,
        blockReason: newBlockedValue ? blockReason.value : null 
      },
    });
    
    useToastify(newBlockedValue ? "Summary blocked" : "Summary unblocked", { type: "success" });
    showBlockInput.value = false;
    emit("updated");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update summary";
    useToastify(message, { type: "error" });
  } finally {
    isUpdating.value = false;
  }
};

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

// Calculate the final AI summarization step by subtracting known stages
const actualAiSummarizingTimeMs = computed(() => {
  if (!props.summary.responseTimeMs) return null;
  const classifierTime = props.summary.youtube?.classifierTimeMs || props.summary.article?.classifierTimeMs || 0;
  const transcriptTime = props.summary.youtube?.transcriptTimeMs || 0;
  return props.summary.responseTimeMs - classifierTime - transcriptTime;
});

// Dynamic timeline steps for sequential numbering
const timelineSteps = computed(() => {
  const steps = [];
  
  if (props.summary.youtube?.transcriptTimeMs) {
    steps.push({ label: 'Transcript', value: props.summary.youtube.transcriptTimeMs });
  }
  
  if (props.summary.youtube?.classifierTimeMs || props.summary.article?.classifierTimeMs) {
    steps.push({ label: 'Classifying', value: props.summary.youtube?.classifierTimeMs || props.summary.article?.classifierTimeMs });
  }
  
  if (actualAiSummarizingTimeMs.value) {
    steps.push({ label: 'Summarizing', value: actualAiSummarizingTimeMs.value });
  }
  
  return steps;
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
              <span class="text-muted-foreground">Visibility</span>
              <div class="mt-1">
                <Badge
                  v-if="summary.isBlocked"
                  variant="destructive"
                  class="!bg-red-600 !text-white border-transparent"
                >
                  Blocked
                </Badge>
                <Badge
                  v-else-if="summary.isHidden"
                  variant="destructive"
                >
                  Hidden
                </Badge>
                <Badge
                  v-else-if="summary.isPublic"
                  variant="outline"
                  class="border-primary/30 text-primary"
                >
                  Public
                </Badge>
                <Badge
                  v-else
                  variant="secondary"
                >
                  Private
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

        <!-- Creator Metadata & Attribution -->
        <div class="space-y-3">
          <h3 class="text-sm font-medium">Creator Metadata & Attribution</h3>
          
          <!-- Identity -->
          <div class="col-span-2 border-b pb-3 mb-1">
            <span class="text-muted-foreground block text-xs uppercase font-medium mb-1">Created By</span>
            <div v-if="summary.user" class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="size-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                  {{ summary.user.name.charAt(0).toUpperCase() }}
                </div>
                <div class="text-sm">
                  <span class="font-medium text-foreground">{{ summary.user.name }}</span>
                  <span class="text-muted-foreground ml-2">({{ summary.user.email }})</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" class="h-6 text-[10px]" as-child>
                <NuxtLink :to="`/admin/users?userId=${summary.user.id}`">
                  View Profile
                </NuxtLink>
              </Button>
            </div>
            <div v-else-if="summary.userId" class="text-sm italic text-muted-foreground flex items-center gap-2">
              <div class="size-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">?</div>
              <span>Anonymous User (ID: {{ summary.userId }})</span>
            </div>
            <div v-else class="text-sm italic text-muted-foreground">
              Unknown (Old Record)
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div v-if="summary.ipAddress">
              <span class="block text-xs uppercase mb-1">IP Address</span>
              <span class="text-foreground font-mono">{{ summary.ipAddress }}</span>
            </div>
            <div v-if="summary.countryCode || summary.city">
              <span class="block text-xs uppercase mb-1">Location</span>
              <span class="text-foreground">{{ summary.city ? summary.city + ', ' : '' }}{{ summary.countryCode }}</span>
            </div>
            <div v-if="summary.utmSource || summary.utmMedium || summary.utmCampaign">
              <span class="block text-xs uppercase mb-1">UTM Tracking</span>
              <span class="text-foreground">
                <Badge v-if="summary.utmSource" variant="secondary" class="font-mono text-[10px] mr-1">src: {{ summary.utmSource }}</Badge>
                <Badge v-if="summary.utmMedium" variant="secondary" class="font-mono text-[10px] mr-1">med: {{ summary.utmMedium }}</Badge>
                <Badge v-if="summary.utmCampaign" variant="secondary" class="font-mono text-[10px]">cmp: {{ summary.utmCampaign }}</Badge>
              </span>
            </div>
            <div v-if="summary.referrer">
              <span class="block text-xs uppercase mb-1">Referrer</span>
              <span class="text-foreground truncate max-w-[200px] block" :title="summary.referrer">{{ summary.referrer }}</span>
            </div>
            <div v-if="summary.umamiSessionId" class="col-span-2">
              <span class="block text-xs uppercase mb-1">Umami Session ID</span>
              <div class="flex items-center gap-2">
                <code class="text-foreground bg-muted px-2 py-1 rounded">{{ summary.umamiSessionId }}</code>
                <span class="text-xs italic text-muted-foreground">Copy to search in Umami Analytics</span>
              </div>
            </div>
            <div v-if="summary.userAgent" class="col-span-2">
              <span class="block text-xs uppercase mb-1">User Agent</span>
              <span class="text-foreground text-xs break-all">{{ summary.userAgent }}</span>
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

        <!-- Performance Metrics -->
        <div v-if="summary.status === 'completed'" class="space-y-3">
          <h3 class="text-sm font-medium">Performance Breakdown</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono">
             <div v-if="summary.essence === 'youtube' || summary.essence === 'article'">
              <span class="text-muted-foreground block mb-1 uppercase">Total Wait Time</span>
              <span class="text-foreground font-semibold">
                {{ formatTime(summary.youtube?.totalTimeMs || summary.article?.totalTimeMs) }}
              </span>
            </div>
            <div>
              <span class="text-muted-foreground block mb-1 uppercase">Total AI Processing</span>
              <span class="text-foreground font-semibold">{{ formatTime(summary.responseTimeMs) }}</span>
            </div>
            <div v-for="(step, index) in timelineSteps" :key="index">
              <span class="text-muted-foreground block mb-1 uppercase">Step {{ index + 1 }}: {{ step.label }}</span>
              <span class="text-foreground font-semibold">
                {{ formatTime(step.value) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Moderation -->
        <div class="space-y-3">
          <h3 class="text-sm font-medium">Moderation</h3>
          <div class="space-y-4">
            <!-- Explore Visibility Toggle -->
            <div class="flex items-center gap-2">
              <Button
                :variant="summary.isHidden ? 'default' : 'outline'"
                size="sm"
                :disabled="isUpdating || showBlockInput"
                @click="toggleHidden"
              >
                <template v-if="isUpdating && !showBlockInput">
                  <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </template>
                <template v-else>
                  <component :is="summary.isHidden ? Eye : EyeOff" class="mr-2 h-4 w-4" />
                  {{ summary.isHidden ? 'Show in Explore' : 'Hide from Explore' }}
                </template>
              </Button>
            </div>

            <!-- Blocking UI -->
            <div v-if="summary.isBlocked" class="space-y-2">
               <div class="flex items-center justify-between">
                 <label class="text-[10px] uppercase font-semibold text-destructive">Summary Blocked</label>
                 <Button variant="ghost" size="sm" class="h-6 text-[10px]" :disabled="isUpdating" @click="toggleBlocked">                   Unblock Access
                 </Button>
               </div>
               <p v-if="summary.blockReason" class="text-xs text-destructive bg-destructive/5 p-2 rounded border border-destructive/10 italic">
                 "{{ summary.blockReason }}"
               </p>
            </div>

            <div v-else class="space-y-3">
              <!-- Initial Block Button -->
              <Button
                v-if="!showBlockInput"
                variant="outline"
                size="sm"
                class="hover:bg-destructive hover:text-white"
                @click="showBlockInput = true"
              >
                <Ban class="mr-2 h-4 w-4" />
                Block Access...
              </Button>

              <!-- Block Reason Input (Revealed) -->
              <div v-else class="space-y-3 p-3 bg-muted/50 rounded-lg border animate-in fade-in slide-in-from-top-1">
                <div class="space-y-1.5">
                  <label class="text-[10px] uppercase font-bold text-foreground">Specify Block Reason</label>
                  <Input 
                    v-model="blockReason" 
                    placeholder="e.g. Hate speech, NSFW content..." 
                    class="h-8 text-sm bg-background"
                    autofocus
                    @keyup.enter="toggleBlocked"
                  />
                  <p class="text-[10px] text-muted-foreground">This message will be shown to users who visit the link.</p>
                </div>
                <div class="flex gap-2">
                  <Button variant="destructive" size="sm" :disabled="isUpdating" @click="toggleBlocked">
                    <template v-if="isUpdating">
                      <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                      Blocking...
                    </template>
                    <template v-else>
                      Confirm Block
                    </template>
                  </Button>
                  <Button variant="ghost" size="sm" :disabled="isUpdating" @click="showBlockInput = false">
                    Cancel
                  </Button>
                </div>
              </div>
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
