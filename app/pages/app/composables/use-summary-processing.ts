type SummaryStatus = "pending" | "processing" | "completed" | "failed";
type Essence = "article" | "youtube" | "reddit";

// YouTube processing stages
type YouTubeStage = "metadata" | "classifying" | "summarizing" | "completed" | null;

interface SummaryData {
  source: string;
  summaryId: string;
  essence: Essence;
  title: string | null;
  summary: string | null;
  status: SummaryStatus;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}

// Stage configurations for YouTube
const YOUTUBE_STAGES = {
  metadata: {
    message: "Fetching video info...",
    icon: "lucide:info",
  },
  classifying: {
    message: "AI is analyzing the video...",
    icon: "lucide:brain-circuit",
  },
  summarizing: {
    message: "AI is generating summary...",
    icon: "lucide:file-text",
  },
  completed: {
    message: "Completed!",
    icon: "lucide:check-circle",
  },
} as const;

export function useSummaryProcessing(
  summary: Ref<SummaryData | null | undefined>,
  refresh: () => Promise<void>
) {
  const currentStage = ref<YouTubeStage>(null);
  let eventSource: EventSource | null = null;

  // Watch currentStage for debugging
  watch(currentStage, (newStage) => {
    console.log(`[Stage] ✓ currentStage changed to: ${newStage}`);
  }, { immediate: true });

  const currentMessage = computed(() => {
    if (!summary.value) return "";

    // Show stage-specific message for YouTube
    if (summary.value.essence === "youtube" && currentStage.value && YOUTUBE_STAGES[currentStage.value]) {
      return YOUTUBE_STAGES[currentStage.value].message;
    }

    switch (summary.value.essence) {
      case "youtube":
        return "Watching your video...";
      case "article":
        return "Reading your article...";
      case "reddit":
        return "Reading your post...";
      default:
        return "Processing...";
    }
  });

  const currentIcon = computed(() => {
    if (!summary.value) return "lucide:loader-2";

    // Show stage-specific icon for YouTube
    if (summary.value.essence === "youtube" && currentStage.value && YOUTUBE_STAGES[currentStage.value]) {
      return YOUTUBE_STAGES[currentStage.value].icon;
    }

    switch (summary.value.essence) {
      case "youtube":
        return "lucide:play-circle";
      case "article":
        return "lucide:book-open";
      case "reddit":
        return "lucide:message-circle";
      default:
        return "lucide:loader-2";
    }
  });

  const stageProgress = computed(() => {
    if (!currentStage.value || currentStage.value === "completed") return 100;
    const stages: readonly ["metadata", "classifying", "summarizing"] = ["metadata", "classifying", "summarizing"];
    const index = stages.indexOf(currentStage.value as "metadata" | "classifying" | "summarizing");
    return index >= 0 ? ((index + 1) / stages.length) * 100 : 0;
  });

  const getStages = computed(() => {
    if (summary.value?.essence !== "youtube") return [];
    return Object.entries(YOUTUBE_STAGES).map(([key, value]) => ({
      stage: key,
      message: value.message,
      icon: value.icon,
    }));
  });

  const getCurrentStageIndex = computed(() => {
    if (!currentStage.value) return -1;
    return getStages.value.findIndex((s) => s.stage === currentStage.value);
  });

  const connectStageStream = () => {
    if (eventSource) {
      console.log("[SSE] Already connected, skipping");
      return;
    }

    // Wait for summaryId to be available
    const tryConnect = () => {
      if (!summary.value?.summaryId) {
        console.log("[SSE] No summaryId yet, retrying in 100ms");
        setTimeout(tryConnect, 100);
        return;
      }

      console.log(`[SSE] Connecting to stream for ${summary.value.summaryId}`);
      eventSource = new EventSource(`/api/summary/${summary.value.summaryId}/stream`);

      eventSource.onopen = () => {
        console.log("[SSE] Connection opened successfully");
      };

      eventSource.onmessage = (event) => {
        console.log("[SSE] Raw message received:", event.data);
        try {
          const data = JSON.parse(event.data);
          console.log("[SSE] Parsed data:", data);
          if (data.stage !== undefined) {
            console.log("[SSE] Updating currentStage to:", data.stage);
            currentStage.value = data.stage;
          }
        } catch (error) {
          console.error("[SSE] Failed to parse message:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("[SSE] Connection error:", error);
        console.error("[SSE] EventSource readyState:", eventSource?.readyState);
        eventSource?.close();
        eventSource = null;
      };
    };

    tryConnect();
  };

  const disconnectStageStream = () => {
    if (eventSource) {
      console.log("[SSE] Disconnecting");
      eventSource.close();
      eventSource = null;
    }
  };

  const startProcessing = async () => {
    if (!summary.value?.source || !summary.value?.summaryId) return;

    try {
      await $fetch("/api/summarize", {
        method: "POST",
        body: {
          url: summary.value.source,
          updateSummaryId: summary.value.summaryId,
        },
      });
      await refresh();
    } catch (err) {
      console.error("Summarize API error:", err);
      await refresh();
    }
  };

  const watchStatusChanges = () => {
    watch(
      () => summary.value?.status,
      (newStatus) => {
        console.log(`[Status] ✓ Changed to: ${newStatus}, essence: ${summary.value?.essence}, summaryId: ${summary.value?.summaryId}`);

        if (newStatus === "pending") {
          startProcessing();
        } else if (newStatus === "processing") {
          // Connect SSE for YouTube videos
          if (summary.value?.essence === "youtube") {
            console.log(`[Status] → YouTube video detected, connecting SSE stream...`);
            connectStageStream();
          } else {
            console.log(`[Status] → Not YouTube (${summary.value?.essence}), skipping SSE`);
          }

          // Keep polling for status changes (articles/reddit)
          const pollInterval = setInterval(async () => {
            await refresh();
            if (summary.value?.status !== "processing") {
              clearInterval(pollInterval);
              disconnectStageStream();
            }
          }, 2000);

          onUnmounted(() => {
            clearInterval(pollInterval);
            disconnectStageStream();
          });
        } else if (newStatus === "completed" || newStatus === "failed") {
          console.log(`[Status] → Processing finished (${newStatus}), disconnecting SSE`);
          // Disconnect SSE when done
          disconnectStageStream();
        }
      },
      { immediate: true } // Check immediately on mount
    );
  };

  return {
    currentMessage,
    currentIcon,
    currentStage,
    stageProgress,
    getStages,
    getCurrentStageIndex,
    startProcessing,
    watchStatusChanges,
  };
}
