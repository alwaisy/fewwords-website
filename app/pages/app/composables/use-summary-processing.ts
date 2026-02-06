type SummaryStatus = "pending" | "processing" | "completed" | "failed";
type Essence = "article" | "youtube" | "reddit";

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

export function useSummaryProcessing(
  summary: Ref<SummaryData | null | undefined>,
  refresh: () => Promise<void>
) {
  const currentMessage = computed(() => {
    if (!summary.value) return "";

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
        if (newStatus === "pending") {
          startProcessing();
        } else if (newStatus === "processing") {
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
  };
}
