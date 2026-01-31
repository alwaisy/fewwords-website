<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const summaryId = route.params.summaryId as string;

// Check for reader mode via query param (?r or ?reader)
const isReaderMode = computed(
  () => "r" in route.query || "reader" in route.query,
);

// Human-like loader states
const loaderStates = [
  "Reading...",
  "Understanding context...",
  "Identifying main ideas...",
  "Extracting key points...",
  "Analyzing arguments...",
  "Synthesizing information...",
  "Writing summary...",
  "Polishing content...",
  "Finalizing...",
] as const;

const currentLoaderIndex = ref(0);

// Fetch summary data from API
const {
  data: summary,
  pending,
  error,
} = await useFetch(`/api/summary/${summaryId}`, {
  onResponse: () => {
    currentLoaderIndex.value = loaderStates.length;
  },
});

// Cycle through loader states while pending
watchEffect(() => {
  if (pending.value) {
    const interval = setInterval(() => {
      if (currentLoaderIndex.value < loaderStates.length - 1) {
        currentLoaderIndex.value++;
      }
    }, 2000);
    onUnmounted(() => clearInterval(interval));
  }
});

// If 404, summary might not exist in DB yet - show state or redirect
if (error.value && !summary.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Summary not found",
  });
}

// Get the display title
const displayTitle = computed(() => {
  return (
    summary.value?.title || `${summary.value?.essence || "Content"} Summary`
  );
});

useHead({
  title: `${displayTitle.value} - Fewwords`,
  titleTemplate: null,
});

function copyLink() {
  navigator.clipboard.writeText(window.location.href);
  // TODO: Add toast notification
}

function doAnother() {
  router.push("/app");
}
</script>

<template>
  <main class="flex-1">
    <article class="py-12 px-4">
      <div class="max-w-2xl mx-auto">
        <!-- Loading State -->
        <div v-if="pending" class="flex flex-col items-center py-20">
          <div
            class="w-16 h-16 mb-6 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <Icon
              name="lucide:loader-2"
              class="w-8 h-8 text-primary animate-spin"
            />
          </div>
          <p class="text-muted-foreground text-lg">
            {{
              loaderStates[
                Math.min(currentLoaderIndex, loaderStates.length - 1)
              ]
            }}
          </p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-20">
          <p class="text-destructive mb-4">Failed to load summary</p>
          <Button variant="outline" @click="doAnother">Go back</Button>
        </div>

        <!-- Summary Content -->
        <div v-else-if="summary">
          <!-- Title (using fetched title or default) -->
          <h1 class="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {{ displayTitle }}
          </h1>

          <!-- Source + Actions -->
          <div class="flex items-center justify-between mb-8">
            <a
              :href="summary.source"
              target="_blank"
              rel="noopener"
              class="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              <span class="capitalize">{{ summary.essence }}</span>
              <Icon name="lucide:external-link" class="w-4 h-4" />
            </a>

            <div class="flex gap-2">
              <Button
                v-if="!isReaderMode"
                variant="outline"
                size="sm"
                @click="copyLink"
              >
                Share
              </Button>
            </div>
          </div>

          <!-- Markdown Content -->
          <ClientOnly>
            <MDC v-if="summary?.summary" :value="summary.summary" class="prose prose-slate w-full max-w-none p-2" />
          </ClientOnly>
        </div>

        <!-- CTA -->
        <div
          v-if="!isReaderMode && summary"
          class="border-t border-border pt-8"
        >
          <Button size="lg" class="w-full sm:w-auto" @click="doAnother">
            Do Another One
          </Button>
        </div>
      </div>
    </article>
  </main>
</template>
