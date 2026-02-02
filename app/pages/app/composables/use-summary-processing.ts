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
  const loadingMessages = [
    "Thinking...",
    "Researching...",
    "Reading...",
    "Extracting...",
    "Writing...",
    "Analyzing...",
    "Processing...",
    "Synthesizing...",
    "Comprehending...",
    "Summarizing...",
    "Digesting...",
    "Understanding...",
    "Evaluating...",
    "Structuring...",
  ] as const;

  const currentMessage = ref<string>("");

  const getRandomMessage = (): string => {
    const index = Math.floor(Math.random() * loadingMessages.length);
    return loadingMessages[index]!;
  };

  const startProcessing = async () => {
    if (!summary.value?.source || !summary.value?.summaryId) return;

    currentMessage.value = getRandomMessage();

    // Cycle messages
    const interval = setInterval(() => {
      currentMessage.value = getRandomMessage();
    }, 1500);

    try {
      await $fetch("/api/summarize", {
        method: "POST",
        body: {
          url: summary.value.source,
          updateSummaryId: summary.value.summaryId,
        },
      });
      clearInterval(interval);
      await refresh();
    } catch (err) {
      console.error("Summarize API error:", err);
      clearInterval(interval);
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
          // Poll for updates every 2 seconds
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
    startProcessing,
    watchStatusChanges,
  };
}
