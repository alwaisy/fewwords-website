<script setup lang="ts">
import { useErrorMessage } from "./composables/use-error-message";
import { useSummaryProcessing } from "./composables/use-summary-processing";

import { createOgImage } from "~/lib/seo/og-image";

const route = useRoute();
const router = useRouter();
const siteUrl = useSiteConfig().url;
const summaryId = route.params.summaryId as string;
const { user } = useAuth();
const { identity } = useUmamiIdentity();

useHead({
  link: [{ rel: "canonical", href: `${siteUrl}/app/${summaryId}` }],
});

// Check for reader mode via query param
const isReaderMode = computed(
  () => "r" in route.query || "reader" in route.query,
);

// Check if summary is saved (for logged-in users)
const isSaved = ref(false);

async function checkIfSaved() {
  if (!user.value) return;
  try {
    const response = await $fetch<{ summaries: { summaryId: string }[] }>(`/api/library/saved?page=1&limit=100`);
    isSaved.value = response.summaries.some((s) => s.summaryId === summaryId);
  } catch (error) {
    console.error('Failed to check saved status:', error);
  }
}

// Fetch summary data from API
const {
  data: summary,
  pending,
  error,
  refresh,
} = await useFetch(`/api/summary/${summaryId}`);

// Check saved status after summary loads
watchEffect(() => {
  if (summary.value && user.value) {
    checkIfSaved();
  }
});

// Get the display title
const displayTitle = computed(() => {
  return (
    summary.value?.title || `${summary.value?.essence || "Content"} Summary`
  );
});

// Get user-friendly error message
const { getFriendlyErrorMessage } = useErrorMessage();
const friendlyErrorMessage = computed(() =>
  getFriendlyErrorMessage(summary.value?.errorMessage || ""),
);

// Summary processing logic
const { currentMessage, currentIcon, watchStatusChanges, liveElapsedTime, totalTime } =
  useSummaryProcessing(summary, refresh);

// Dev mode check (only show time tracking in dev)
const isDev = computed(() => import.meta.dev);

// Setup reactive meta fields
const summaryTitle = computed(() => summary.value?.title || "");
const metaDescription = computed(() => {
  if (!summary.value || summary.value.status !== "completed" || !summary.value.title) return "";

  const typeLabels: Record<string, string> = {
    article: "Article",
    youtube: "Video",
    reddit: "Thread"
  };
  const typeLabel = typeLabels[summary.value.essence] || summary.value.essence;
  
  let platformName = "";
  try {
    const url = new URL(summary.value.source);
    if (summary.value.essence === "youtube") platformName = "YouTube";
    else if (summary.value.essence === "reddit") platformName = "Reddit";
    else platformName = url.hostname.replace("www.", "");
  } catch {
    platformName = "";
  }

  return platformName 
    ? `Read this concise ${typeLabel} summary from ${platformName}. ${summary.value.title}. Summarised by Fewwords in 60 seconds.`
    : `Read this concise ${typeLabel} summary. ${summary.value.title}. Summarised by Fewwords in 60 seconds.`;
});

const ogImageUrl = computed(() => {
  if (!summary.value || summary.value.status !== "completed" || !summary.value.title) return null;
  
  let platformName = "";
  try {
    const url = new URL(summary.value.source);
    platformName = url.hostname.replace("www.", "");
  } catch {
    // ignore invalid url parse errors
  }

  return createOgImage({
    title: summary.value.title,
    meta: `${platformName} · summarised by Fewwords`,
  });
});

// Reactive metadata (works server side + client side)
useSeoMeta({
  title: () => summaryTitle.value ? `${summaryTitle.value} - Fewwords` : "Fewwords",
  titleTemplate: null,
  description: () => metaDescription.value,
  ogTitle: () => summaryTitle.value ? `${summaryTitle.value} - Fewwords` : "Fewwords",
  ogDescription: () => metaDescription.value,
  ogType: "article",
  ogImage: () => ogImageUrl.value,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  twitterTitle: () => summaryTitle.value ? `${summaryTitle.value} - Fewwords` : "Fewwords",
  twitterDescription: () => metaDescription.value,
  twitterCard: "summary_large_image",
  twitterImage: () => ogImageUrl.value,
});



function copyLink() {
  navigator.clipboard.writeText(window.location.href);
  useToastify("Link copied!");
  if (summary.value?.summaryId) {
  umTrackEvent('summary-share', { 
    summaryId: summary.value.summaryId,
    ...identity.value
  });
  }
}

function navigateToSocial() {
  if (!summary.value) return;
  const summaryId = summary.value.summaryId;
  umTrackEvent('summary-social', { 
    summaryId,
    ...identity.value
  });
  window.open(`/admin/social?summaryId=${summaryId}`, '_blank');
}

function openSource() {
  if (summary.value?.source) {
    window.open(summary.value.source, "_blank", "noopener,noreferrer");
  }
}

async function saveSummary() {
  if (!user.value) {
    useToastify("Please login to save summaries", { type: "error" });
    return;
  }

  try {
    await $fetch("/api/library/save", {
      method: "POST",
      body: { summaryId },
    });
    isSaved.value = true;
    useToastify("Saved to library!", { type: "success" });
  umTrackEvent('summary-save', { 
    summaryId,
    ...identity.value
  });
  } catch {
    useToastify("Failed to save", { type: "error" });
  }
}

async function unsaveSummary() {
  if (!user.value) return;

  try {
    await $fetch("/api/library/save", {
      method: "DELETE",
      body: { summaryId },
    });
    isSaved.value = false;
    useToastify("Removed from library", { type: "info" });
    umTrackEvent('summary-unsave', { 
      summaryId,
      ...identity.value
    });
  } catch {
    useToastify("Failed to unsave", { type: "error" });
  }
}

function doAnother() {
  umTrackEvent('summary-new', identity.value);
  router.push("/app");
}

// Watch for status changes (handles pending processing via immediate: true)
watchStatusChanges();
</script>

<template>
  <main class="flex-1">
    <article class="py-12 px-4">
      <div class="max-w-2xl mx-auto">
        <!-- Initial Load Skeleton -->
        <AppSummarySkeleton v-if="pending" />

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-20">
          <div
            class="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <Icon name="lucide:ghost" size="3rem" class="text-primary" />
          </div>
          <h1 class="text-2xl font-bold text-foreground mb-3">
            Well, this is awkward
          </h1>
          <p class="text-muted-foreground mb-8 max-w-md mx-auto">
            The summary went into hiding. Maybe it exists in another dimension?
          </p>
          <Button v-umami="'summary-new'" variant="outline" @click="doAnother">Try another URL</Button>
        </div>

        <!-- Processing State (pending or processing) -->
        <div
          v-else-if="
            summary &&
            (summary.status === 'pending' || summary.status === 'processing')
          "
          class="text-center py-20 animate-pulse"
        >
          <div
            class="w-16 h-16 mx-auto mb-6 relative flex items-center justify-center"
          >
            <div
              class="absolute inset-0 rounded-full border-2 border-primary/20"
            />
            <div
              class="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin"
            />
            <Icon :name="currentIcon" size="2.5rem" class="text-primary" />
          </div>

          <h1 class="text-xl font-medium text-foreground mb-8">
            {{ currentMessage }}
          </h1>

          <!-- Time tracking (dev mode only) -->
          <div v-if="isDev" class="text-sm text-muted-foreground font-mono">
            {{ liveElapsedTime }}
          </div>

          <!-- Background Job UI - User can close tab -->
          <div v-if="summary.isBackgroundJob" class="max-w-md mx-auto space-y-3 mt-8">
            <p class="text-sm text-muted-foreground">
              This video takes a bit longer. Feel free to close this tab. I will email you when it is ready.
            </p>
            <Button v-umami="'summary-copy-link'" variant="outline" size="sm" class="gap-2" @click="copyLink">
              <Icon name="lucide:copy" size="1rem" />
              Copy link
            </Button>
            <div v-if="user" class="pt-1">
              <NuxtLink to="/app/library" class="text-sm text-primary hover:underline">
                View in your library
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Failed State -->
        <div
          v-else-if="summary && summary.status === 'failed'"
          class="text-center py-20"
        >
          <div
            class="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <Icon name="lucide:zap-off" size="2.5rem" class="text-primary" />
          </div>
          <h1 class="text-2xl font-bold text-foreground mb-3">
            Well, that didn't work
          </h1>
          <p class="text-muted-foreground mb-8 max-w-md mx-auto">
            {{ friendlyErrorMessage }}
          </p>
          <div class="flex gap-3 justify-center">
            <Button v-umami="'summary-retry'" variant="outline" @click="doAnother">
              >Try another URL</Button
            >
          </div>
        </div>

        <!-- Completed State -->
        <template
          v-else-if="
            summary && summary.summary && summary.status === 'completed'
          "
        >
          <!-- Total time display (dev mode only) -->
          <div v-if="isDev && totalTime" class="text-center text-sm text-muted-foreground font-mono mb-4">
            Total time: {{ totalTime }}
          </div>

           <AppSummaryHeader
            :key="`header-${summary.summaryId}`"
            :title="displayTitle"
            :source-url="summary.source"
            :reader-mode="isReaderMode"
            :is-saved="isSaved"
            :last-updated="summary?.completedAt ?? undefined"
            @share="copyLink"
            @social="navigateToSocial"
            @open-source="openSource"
            @save="saveSummary"
            @unsave="unsaveSummary"
          />
          <AppSummaryContent
            :content="summary.summary"
            :source-url="summary.source"
          />
          <AppSummaryFooter
            :key="`footer-${summary.summaryId}`"
            :reader-mode="isReaderMode"
            :last-updated="summary?.completedAt ?? undefined"
            :content="summary.summary"
            @do-another="doAnother"
          />
        </template>
      </div>
    </article>
  </main>
</template>
