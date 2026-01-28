<script setup lang="ts">
const route = useRoute();
const summaryId = route.params.id as string;

// Check for reader mode via query param (?r or ?reader)
const isReaderMode = computed(
  () => "r" in route.query || "reader" in route.query,
);

// TODO: Fetch actual data from API
// const { data: summary } = await useFetch(`/api/summaries/${summaryId}`)

// Mock data - will be replaced with actual API call
const isArticle = ref(true); // toggle based on data.type === 'article'

const articleSummary = {
  title: "The Future of Artificial Intelligence in 2024",
  source: "https://example.com/ai-future",
  mainArgument:
    "AI is transitioning from experimental to practical applications, with focus on specialized models rather than general-purpose ones.",
  keyPoints: [
    "Specialized AI models are outperforming general models in specific domains",
    'Companies are shifting from "build everything" to "buy and customize"',
    "Regulatory frameworks are emerging globally to govern AI development",
    "Energy efficiency is becoming a critical factor in AI model design",
    "Edge computing is enabling AI to run on consumer devices",
  ],
  examples: [
    "Healthcare AI now matches human experts in radiology diagnosis",
    "GitHub Copilot handles 40% of boilerplate code for developers",
  ],
  takeaway:
    "The AI landscape is maturing. Success comes from applying the right tool to specific problems, not chasing the biggest model.",
};

const videoSummary = {
  title: "How AI Actually Works - Explained Simply",
  thumbnail: "https://img.youtube.com/vi/example/maxresdefault.jpg",
  embedUrl: "https://www.youtube.com/embed/example",
  mainThesis:
    "AI isn't magic - it's pattern recognition at scale, built on layers of simple math operations.",
  keyInsights: [
    "Neural networks learn by adjusting weights based on errors",
    "Training data quality matters more than model size",
    'AI "hallucinations" are just confident wrong answers',
    'Large language models predict next tokens, not "think"',
  ],
  timestamps: [
    { time: "2:15", label: "What is a neural network?" },
    { time: "8:30", label: "Training process explained" },
    { time: "15:45", label: "Why AI makes mistakes" },
  ],
};

const summary = computed(() =>
  isArticle.value ? articleSummary : videoSummary,
);

function copyLink() {
  navigator.clipboard.writeText(window.location.href);
  // TODO: Add toast notification
}

async function saveToAccount() {
  // TODO: Implement save functionality
  // Check if user is logged in
  // If yes: save to their account
  // If no: redirect to login or show signup prompt
}

useHead({
  title: `The Future of Artificial Intelligence in 2024 - Fewwords`,
  titleTemplate: null,
});
</script>

<template>
  <main class="flex-1">
    <article class="py-12 px-4">
      <div class="max-w-2xl mx-auto">
        <!-- Article Mode -->
        <template v-if="isArticle">
          <!-- Title -->
          <h1 class="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {{ summary.title }}
          </h1>

          <!-- Source + Actions -->
          <div class="flex items-center justify-between mb-8">
            <a
              :href="summary.source"
              target="_blank"
              rel="noopener"
              class="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              <span>Source</span>
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
              <Button variant="outline" size="sm" @click="saveToAccount">
                Save
              </Button>
            </div>
          </div>

          <!-- Main Argument -->
          <section class="mb-10">
            <h2 class="text-lg font-semibold text-foreground mb-3">
              Main Idea
            </h2>
            <p class="text-lg text-muted-foreground leading-relaxed">
              {{ summary.mainArgument }}
            </p>
          </section>

          <!-- Key Points -->
          <section class="mb-10">
            <h2 class="text-lg font-semibold text-foreground mb-4">
              Key Points
            </h2>
            <ul class="space-y-3">
              <li
                v-for="(point, index) in summary.keyPoints"
                :key="index"
                class="flex gap-3 text-muted-foreground"
              >
                <span class="text-primary font-bold">{{ index + 1 }}</span>
                <span>{{ point }}</span>
              </li>
            </ul>
          </section>

          <!-- Examples -->
          <section class="mb-10">
            <h2 class="text-lg font-semibold text-foreground mb-4">
              Examples & Data
            </h2>
            <ul class="space-y-2">
              <li
                v-for="(example, index) in summary.examples"
                :key="index"
                class="flex gap-2 text-muted-foreground text-sm"
              >
                <span>💡</span>
                <span>{{ example }}</span>
              </li>
            </ul>
          </section>

          <!-- Takeaway -->
          <section
            class="bg-muted/30 border border-border rounded-lg p-6 mb-10"
          >
            <h2 class="text-lg font-semibold text-foreground mb-2">Takeaway</h2>
            <p class="text-muted-foreground">
              {{ summary.takeaway }}
            </p>
          </section>
        </template>

        <!-- Video Mode -->
        <template v-else>
          <!-- Video Embed -->
          <div class="aspect-video bg-muted rounded-lg mb-6 overflow-hidden">
            <iframe
              :src="summary.embedUrl"
              class="w-full h-full"
              frameborder="0"
              allowfullscreen
            />
          </div>

          <!-- Title -->
          <h1 class="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {{ summary.title }}
          </h1>

          <!-- Actions Row -->
          <div class="flex justify-end gap-2 mb-8">
            <Button
              v-if="!isReaderMode"
              variant="outline"
              size="sm"
              @click="copyLink"
            >
              Share
            </Button>
            <Button variant="outline" size="sm" @click="saveToAccount">
              Save
            </Button>
          </div>

          <!-- Main Thesis -->
          <section class="mb-10">
            <h2 class="text-lg font-semibold text-foreground mb-3">
              Main Thesis
            </h2>
            <p class="text-lg text-muted-foreground leading-relaxed">
              {{ summary.mainThesis }}
            </p>
          </section>

          <!-- Key Insights -->
          <section class="mb-10">
            <h2 class="text-lg font-semibold text-foreground mb-4">
              Key Insights
            </h2>
            <ul class="space-y-3">
              <li
                v-for="(insight, index) in summary.keyInsights"
                :key="index"
                class="flex gap-3 text-muted-foreground"
              >
                <span class="text-primary font-bold">{{ index + 1 }}</span>
                <span>{{ insight }}</span>
              </li>
            </ul>
          </section>

          <!-- Timestamps -->
          <section class="mb-10">
            <h2 class="text-lg font-semibold text-foreground mb-4">
              Best Moments
            </h2>
            <div class="space-y-2">
              <a
                v-for="(timestamp, index) in summary.timestamps"
                :key="index"
                href="#"
                class="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors p-2 rounded hover:bg-muted/50"
              >
                <span class="font-mono text-primary">{{ timestamp.time }}</span>
                <span>{{ timestamp.label }}</span>
              </a>
            </div>
          </section>
        </template>

        <!-- CTA -->
        <div v-if="!isReaderMode" class="border-t border-border pt-8">
          <Button size="lg" class="w-full sm:w-auto"> Do Another One </Button>
        </div>
      </div>
    </article>
  </main>
</template>
