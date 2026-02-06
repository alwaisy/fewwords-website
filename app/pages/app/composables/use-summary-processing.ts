type SummaryStatus = "pending" | "processing" | "completed" | "failed";
type Essence = "article" | "youtube" | "reddit";

// YouTube processing stages
type YouTubeStage = "metadata" | "classifying" | "summarizing";

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

interface StageProgress {
  stage: YouTubeStage;
  message: string;
  icon: string;
  minTime: number; // seconds - minimum time before this stage
  maxTime: number; // seconds - maximum time for this stage
}

const YOUTUBE_STAGES: Record<YouTubeStage, StageProgress> = {
  metadata: {
    stage: "metadata",
    message: "Fetching video metadata...",
    icon: "lucide:info",
    minTime: 0,
    maxTime: 5, // 0-5s
  },
  classifying: {
    stage: "classifying",
    message: "AI is analyzing the video (77s for long videos)...",
    icon: "lucide:brain-circuit",
    minTime: 5,
    maxTime: 82, // 5-82s (5 + 77)
  },
  summarizing: {
    stage: "summarizing",
    message: "AI is generating summary (177s for long videos)...",
    icon: "lucide:file-text",
    minTime: 82,
    maxTime: 259, // 82-259s (82 + 177)
  },
};

export function useSummaryProcessing(
  summary: Ref<SummaryData | null | undefined>,
  refresh: () => Promise<void>
) {
  const currentStage = ref<YouTubeStage | null>(null);
  const stageProgress = ref(0); // 0-100 for current stage

  const currentMessage = computed(() => {
    if (!summary.value) return "";

    // Show stage-specific message for YouTube
    if (summary.value.essence === "youtube" && currentStage.value) {
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
    if (summary.value.essence === "youtube" && currentStage.value) {
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
    return Object.values(YOUTUBE_STAGES);
  });

  const getCurrentStageIndex = computed(() => {
    if (!currentStage.value) return -1;
    return getStages.value.findIndex((s) => s.stage === currentStage.value);
  });

  const updateStageBasedOnTime = () => {
    if (!processingStartTime.value) return;

    const elapsed = (Date.now() - processingStartTime.value) / 1000; // seconds

    // Determine current stage based on elapsed time
    if (elapsed < YOUTUBE_STAGES.metadata.maxTime) {
      currentStage.value = "metadata";
      stageProgress.value = (elapsed / YOUTUBE_STAGES.metadata.maxTime) * 100;
    } else if (elapsed < YOUTUBE_STAGES.classifying.maxTime) {
      currentStage.value = "classifying";
      const stageElapsed = elapsed - YOUTUBE_STAGES.classifying.minTime;
      const stageDuration = YOUTUBE_STAGES.classifying.maxTime - YOUTUBE_STAGES.classifying.minTime;
      stageProgress.value = (stageElapsed / stageDuration) * 100;
    } else if (elapsed < YOUTUBE_STAGES.summarizing.maxTime) {
      currentStage.value = "summarizing";
      const stageElapsed = elapsed - YOUTUBE_STAGES.summarizing.minTime;
      const stageDuration = YOUTUBE_STAGES.summarizing.maxTime - YOUTUBE_STAGES.summarizing.minTime;
      stageProgress.value = Math.min(100, (stageElapsed / stageDuration) * 100);
    }
  };

  const watchStatusChanges = () => {
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
        if (newStatus === "pending") {
          startProcessing();
        } else if (newStatus === "processing") {
          // Poll for updates (for articles/reddit)
          const pollInterval = setInterval(async () => {
            await refresh();
            if (summary.value?.status !== "processing") {
              clearInterval(pollInterval);
            }
          }, 2000);

          onUnmounted(() => clearInterval(pollInterval));
        }
      },
    );
  };

  return {
    currentMessage,
    currentIcon,
    startProcessing,
    watchStatusChanges,
    currentStage,
    stageProgress,
    getStages,
    getCurrentStageIndex,
  };
}
