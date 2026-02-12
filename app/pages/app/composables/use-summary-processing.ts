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

// Stage configurations for YouTube (fallback defaults)
const YOUTUBE_STAGES = {
  metadata: {
    message: "I'm checking the video...",
    icon: "lucide:info",
  },
  classifying: {
    message: "I'm analyzing what's in this video...",
    icon: "lucide:brain-circuit",
  },
  summarizing: {
    message: "I'm watching the full video and taking notes...",
    icon: "lucide:file-text",
  },
  completed: {
    message: "All done! Here's your summary.",
    icon: "lucide:check-circle",
  },
} as const;

export function useSummaryProcessing(
  summary: Ref<SummaryData | null | undefined>,
  refresh: () => Promise<void>
) {
  const currentStage = ref<YouTubeStage>(null);
  let eventSource: EventSource | null = null;

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
      return;
    }

    // Only run on client - EventSource doesn't exist during SSR
    onMounted(() => {
      // Wait for summaryId to be available
      const tryConnect = () => {
        if (!summary.value?.summaryId) {
          setTimeout(tryConnect, 100);
          return;
        }

        try {
          eventSource = new EventSource(`/api/summary/${summary.value.summaryId}/stream`);

          eventSource.onmessage = async (event) => {
            try {
              const data = JSON.parse(event.data);
              if (data.stage !== undefined) {
                console.log(`[Frontend SSE] Stage received: ${data.stage}`);
                currentStage.value = data.stage;
                // Fetch final summary data when completed
                if (data.stage === "completed") {
                  console.log(`[Frontend SSE] Stage is completed, calling refresh()...`);
                  console.log(`[Frontend SSE] Before refresh - summary.value.title: ${summary.value?.title}, summary.value.summary: ${summary.value?.summary ? '(exists)' : '(null)'}`);
                  await refresh();
                  console.log(`[Frontend SSE] After refresh - summary.value.title: ${summary.value?.title}, summary.value.summary: ${summary.value?.summary ? '(exists)' : '(null)'}`);
                }
              }
            } catch {
              // Ignore parse errors
            }
          };

          eventSource.onerror = () => {
            eventSource?.close();
            eventSource = null;
          };
        } catch (err) {
          // EventSource not available (SSR or unsupported browser)
          console.error('[SSE] Failed to connect:', err);
        }
      };

      tryConnect();
    });
  };

  const disconnectStageStream = () => {
    if (eventSource) {
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
    } catch {
      await refresh();
    }
  };

  const watchStatusChanges = () => {
    let pollInterval: NodeJS.Timeout | null = null;

    watch(
      () => summary.value?.status,
      (newStatus, oldStatus) => {
        console.log(`[Frontend Watch] Status changed: ${oldStatus} → ${newStatus}`);
        console.log(`[Frontend Watch] Current data - title: ${summary.value?.title ? '(exists)' : '(null)'}, summary: ${summary.value?.summary ? '(exists, length=' + summary.value.summary.length + ')' : '(null/empty)'}`);

        if (newStatus === "pending") {
          startProcessing();
        }

        // Connect SSE for YouTube videos immediately, regardless of status
        if (summary.value?.essence === "youtube" && !eventSource) {
          connectStageStream();
        }

        // Keep polling for status changes (articles/reddit)
        if (newStatus === "processing" && summary.value?.essence !== "youtube") {
          // Clear any existing poll interval first
          if (pollInterval) {
            clearInterval(pollInterval);
          }
          console.log(`[Frontend Watch] Starting poll interval for articles/reddit...`);
          pollInterval = setInterval(async () => {
            console.log(`[Frontend Watch] Polling refresh()...`);
            await refresh();
            console.log(`[Frontend Watch] After poll refresh - status: ${summary.value?.status}, title: ${summary.value?.title ? '(exists)' : '(null)'}`);
            if (summary.value?.status !== "processing") {
              if (pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
              }
            }
          }, 2000);
        }

        // Disconnect SSE when completed/failed
        if ((newStatus === "completed" || newStatus === "failed") && eventSource) {
          console.log(`[Frontend Watch] Disconnecting SSE (status: ${newStatus})`);
          disconnectStageStream();
        }

        // Final refresh when transitioning from processing to completed
        // (handles race condition where poll may have missed the data)
        if (oldStatus === "processing" && newStatus === "completed") {
          console.log(`[Frontend Watch] processing → completed, calling refresh()...`);
          console.log(`[Frontend Watch] Before final refresh - title: ${summary.value?.title ? '(exists)' : '(null)'}, summary: ${summary.value?.summary ? '(exists)' : '(null)'}`);
          refresh().then(() => {
            console.log(`[Frontend Watch] After final refresh - title: ${summary.value?.title ? '(exists)' : '(null)'}, summary: ${summary.value?.summary ? '(exists)' : '(null)'}`);
          });
        }

        // Also refresh when page loads with already completed summary (oldStatus is undefined)
        // This ensures data is fresh when navigating to a completed summary
        // Check for null, undefined, OR empty string
        const summaryIsEmpty = !summary.value?.summary || summary.value.summary.trim().length === 0;
        if (oldStatus === undefined && newStatus === "completed" && summaryIsEmpty) {
          console.log(`[Frontend Watch] Page loaded with completed summary but ${!summary.value?.summary ? 'null' : 'empty'} summary, calling refresh()...`);
          refresh().then(() => {
            console.log(`[Frontend Watch] After refresh - title: ${summary.value?.title ? '(exists)' : '(null)'}, summary: ${summary.value?.summary ? '(exists)' : '(null)'}`);
          });
        }
      },
      { immediate: true }
    );

    // Cleanup interval on unmount
    onUnmounted(() => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    });
  };

  return {
    currentMessage,
    currentIcon,
    currentStage,
    getStages,
    getCurrentStageIndex,
    startProcessing,
    watchStatusChanges,
  };
}
