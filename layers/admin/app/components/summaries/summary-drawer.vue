<script setup lang="ts">
import { Ban, ExternalLink, Eye, EyeOff, Loader2 } from "lucide-vue-next";
import { computed, ref, watch } from "vue";

import { formatTime } from "../../lib/formatters";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { countWords } from "~/lib/utils";
import type { Article, Summary, YouTube } from "~~/database/orm/schema";
import { parseErrorLog } from "~~/server/lib/errors";

// Define a more specific type for the summary with all relations and JSONB fields
export interface FullSummary extends Summary {
  youtube?: YouTube | null;
  article?: Article | null;
  user?: {
    id: string;
    email: string;
    name: string;
  } | null;
  attribution: {
    utmMedium?: string | null;
    utmCampaign?: string | null;
    utmContent?: string | null;
    utmTerm?: string | null;
    referrer?: string | null;
    umamiSessionId?: string | null;
    // Expanded Geo
    region?: string | null;
    postalCode?: string | null;
    isp?: string | null;
  } | null;
  metadata: {
    deviceId?: string | null;
    userAgent?: string | null;
  } | null;
}

const props = defineProps<{
  summary: FullSummary;
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
        <div class="space-y-4 pb-6">
        <!-- Metadata -->
        <Card>
          <CardHeader class="pb-3 px-4 pt-4">
            <CardTitle class="text-sm font-medium">Metadata</CardTitle>
          </CardHeader>
          <CardContent class="px-4 pb-4">
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
          </CardContent>
        </Card>

        <!-- Creator Metadata & Attribution -->
        <Card>
          <CardHeader class="pb-3 px-4 pt-4">
            <CardTitle class="text-sm font-medium">Creator Metadata & Attribution</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4 px-4 pb-4">
            <!-- Identity -->
            <div class="border-b pb-3">
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
                <span class="block text-xs uppercase mb-1 font-medium">IP Address</span>
                <span class="text-foreground font-mono">{{ summary.ipAddress }}</span>
              </div>
              <div v-if="summary.countryCode || summary.city">
                <span class="block text-xs uppercase mb-1 font-medium">Location</span>
                <span class="text-foreground">
                  {{ summary.city ? summary.city + ', ' : '' }}
                  {{ summary.attribution?.region ? summary.attribution.region + ', ' : '' }}
                  {{ summary.countryCode }}
                  <span v-if="summary.attribution?.postalCode" class="ml-1 text-[10px] font-mono">({{ summary.attribution.postalCode }})</span>
                </span>
              </div>
              <div v-if="summary.attribution?.isp">
                <span class="block text-xs uppercase mb-1 font-medium">ISP / Network</span>
                <span class="text-foreground text-xs">{{ summary.attribution.isp }}</span>
              </div>
              <div v-if="summary.utmSource || summary.attribution?.utmMedium || summary.attribution?.utmCampaign">
                <span class="block text-xs uppercase mb-1 font-medium">UTM Tracking</span>
                <span class="text-foreground">
                  <Badge v-if="summary.utmSource" variant="secondary" class="font-mono text-[10px] mr-1">src: {{ summary.utmSource }}</Badge>
                  <Badge v-if="summary.attribution?.utmMedium" variant="secondary" class="font-mono text-[10px] mr-1">med: {{ summary.attribution.utmMedium }}</Badge>
                  <Badge v-if="summary.attribution?.utmCampaign" variant="secondary" class="font-mono text-[10px]">cmp: {{ summary.attribution.utmCampaign }}</Badge>
                </span>
              </div>
              <div v-if="summary.attribution?.referrer">
                <span class="block text-xs uppercase mb-1 font-medium">Referrer</span>
                <span class="text-foreground truncate max-w-[200px] block" :title="summary.attribution.referrer">{{ summary.attribution.referrer }}</span>
              </div>
              <div v-if="summary.attribution?.umamiSessionId" class="col-span-2">
                <span class="block text-xs uppercase mb-1 font-medium">Umami Session ID</span>
                <div class="flex items-center gap-2">
                  <code class="text-foreground bg-muted px-2 py-1 rounded text-xs">{{ summary.attribution.umamiSessionId }}</code>
                </div>
              </div>
              <div v-if="summary.metadata?.deviceId" class="col-span-2">
                <span class="block text-xs uppercase mb-1 font-medium">Device ID</span>
                <code class="text-foreground bg-muted px-2 py-1 rounded text-xs">{{ summary.metadata.deviceId }}</code>
              </div>
              <div v-if="summary.metadata?.userAgent" class="col-span-2">
                <span class="block text-xs uppercase mb-1 font-medium">User Agent</span>
                <span class="text-foreground text-xs break-all leading-tight">{{ summary.metadata.userAgent }}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Content Details -->
        <Card v-if="summary.essence === 'youtube' || summary.essence === 'article'">
          <CardHeader class="pb-3 px-4 pt-4">
            <CardTitle class="text-sm font-medium">Content Details</CardTitle>
          </CardHeader>
          <CardContent class="px-4 pb-4">
            <div class="text-sm text-muted-foreground space-y-1">
              <template v-if="summary.essence === 'youtube'">
                <div v-if="summary.youtube?.duration">
                  Duration: {{ Number(summary.youtube.duration).toFixed(1) }} minutes
                </div>
                <div v-if="summary.youtube?.category">
                  Category: {{ summary.youtube.category }}
                </div>
              </template>
              <template v-else-if="summary.essence === 'article'">
                <div v-if="summary.article?.readingTimeMinutes">
                  Reading Time: {{ summary.article.readingTimeMinutes }} minutes
                </div>
              </template>
            </div>
          </CardContent>
        </Card>

        <!-- Summary -->
        <Card v-if="summary.summary">
          <CardHeader class="pb-3 flex flex-row items-center justify-between space-y-0 px-4 pt-4">
            <CardTitle class="text-sm font-medium">Summary</CardTitle>
            <span class="text-xs text-muted-foreground">
              {{ summaryWordCount.toLocaleString() }} words
            </span>
          </CardHeader>
          <CardContent class="px-4 pb-4">
            <div class="text-sm whitespace-pre-wrap bg-muted/30 p-3 rounded-md border">
              {{ summary.summary }}
            </div>
          </CardContent>
        </Card>

        <!-- Performance Metrics -->
        <Card v-if="summary.status === 'completed'">
          <CardHeader class="pb-3 px-4 pt-4">
            <CardTitle class="text-sm font-medium">Performance Breakdown</CardTitle>
          </CardHeader>
          <CardContent class="px-4 pb-4">
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono">
               <div v-if="summary.essence === 'youtube' || summary.essence === 'article'">
                <span class="text-muted-foreground block mb-1 uppercase text-[10px] font-medium">Total Wait Time</span>
                <span class="text-foreground font-semibold">
                  {{ formatTime(summary.youtube?.totalTimeMs || summary.article?.totalTimeMs) }}
                </span>
              </div>
              <div>
                <span class="text-muted-foreground block mb-1 uppercase text-[10px] font-medium">Total AI Processing</span>
                <span class="text-foreground font-semibold">{{ formatTime(summary.responseTimeMs) }}</span>
              </div>
              <div v-for="(step, index) in timelineSteps" :key="index">
                <span class="text-muted-foreground block mb-1 uppercase text-[10px] font-medium">Step {{ index + 1 }}: {{ step.label }}</span>
                <span class="text-foreground font-semibold">
                  {{ formatTime(step.value) }}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Moderation -->
        <Card>
          <CardHeader class="pb-3 px-4 pt-4">
            <CardTitle class="text-sm font-medium">Moderation</CardTitle>
          </CardHeader>
          <CardContent class="px-4 pb-4">
            <div class="flex flex-row items-center gap-2 flex-wrap">
              <!-- Explore Visibility Toggle -->
              <Button
                :variant="summary.isHidden ? 'default' : 'outline'"
                size="sm"
                class="min-w-[150px]"
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

              <!-- Blocking UI -->
              <template v-if="summary.isBlocked">
                 <div class="flex flex-row items-center gap-2 bg-destructive/5 px-3 py-1 rounded border border-destructive/10">
                   <label class="text-[10px] uppercase font-bold text-destructive">Blocked</label>
                   <p v-if="summary.blockReason" class="text-xs text-destructive italic truncate max-w-[200px]">
                     "{{ summary.blockReason }}"
                   </p>
                   <Button variant="ghost" size="sm" class="h-7 text-[10px] text-destructive hover:bg-destructive/10 px-3" :disabled="isUpdating" @click="toggleBlocked">
                     Unblock Access
                   </Button>
                 </div>
              </template>

              <template v-else>
                <!-- Initial Block Button -->
                <Button
                  v-if="!showBlockInput"
                  variant="outline"
                  size="sm"
                  class="hover:bg-destructive hover:text-white min-w-[150px]"
                  @click="showBlockInput = true"
                >
                  <Ban class="mr-2 h-4 w-4" />
                  Block Access
                </Button>

                <!-- Block Reason Input (Revealed) -->
                <div v-else class="flex flex-row items-center gap-2 flex-1 min-w-[350px] animate-in fade-in slide-in-from-left-1">
                  <Input
                    v-model="blockReason"
                    placeholder="Reason for blocking (e.g. NSFW, Spam)"
                    class="h-9 text-xs flex-1"
                    autofocus
                    @keyup.enter="toggleBlocked"
                  />
                  <Button variant="destructive" size="sm" class="h-9 px-4 min-w-[100px]" :disabled="isUpdating" @click="toggleBlocked">
                    <template v-if="isUpdating">
                      <Loader2 class="h-3 w-3 animate-spin" />
                    </template>
                    <template v-else>
                      Confirm Block
                    </template>
                  </Button>
                  <Button variant="ghost" size="sm" class="h-9 px-3 text-xs" :disabled="isUpdating" @click="showBlockInput = false">
                    Cancel
                  </Button>
                </div>
              </template>
            </div>
          </CardContent>
        </Card>

        <!-- Timestamps -->
        <Card>
          <CardHeader class="pb-3 px-4 pt-4">
            <CardTitle class="text-sm font-medium">Timestamps</CardTitle>
          </CardHeader>
          <CardContent class="px-4 pb-4">
            <div class="text-sm text-muted-foreground space-y-1">
              <div>
                Created: {{ new Date(summary.createdAt).toLocaleString() }}
              </div>
              <div v-if="summary.completedAt">
                Completed: {{ new Date(summary.completedAt).toLocaleString() }}
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Error Log -->
        <Card v-if="errorLog.length" class="border-destructive/30">
          <CardHeader class="pb-3 px-4 pt-4">
            <CardTitle class="text-sm font-medium text-destructive">Errors ({{ errorLog.length }})</CardTitle>
          </CardHeader>
          <CardContent class="px-4 pb-4">
            <div class="space-y-3">
              <div
                v-for="(error, i) in errorLog"
                :key="i"
                class="p-3 bg-destructive/10 rounded-md space-y-1 border border-destructive/10"
              >
                <div class="flex items-center gap-2">
                  <Badge :variant="error.type === 'email' ? 'secondary' : 'destructive'">
                    {{ error.type }}
                  </Badge>
                  <span v-if="error.retryCount" class="text-xs text-muted-foreground">
                    retry #{{ error.retryCount }}
                  </span>
                </div>
                <p class="text-sm text-destructive font-medium">{{ error.message }}</p>
                <p class="text-xs text-muted-foreground">
                  {{ new Date(error.timestamp).toLocaleString() }}
                </p>
                <pre
                  v-if="error.raw"
                  class="text-xs text-muted-foreground mt-1 p-2 bg-muted rounded overflow-x-auto border text-[10px]"
                >{{ error.raw }}</pre>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

      <DrawerFooter class="shrink-0 px-4 pb-6 border-t pt-4">
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
