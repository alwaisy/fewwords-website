<script setup lang="ts">
import { useUmamiIdentity } from '~/composables/use-umami-identity'
import { parseInlineMarkdown } from '~/lib/markdown'
import { extractDomain, formatDate, getEssenceLabel } from '~/lib/summary'

const siteUrl = useSiteConfig().url;

useHead({
  link: [{ rel: "canonical", href: `${siteUrl}/explore` }],
});

useSeoMeta({
  title: "Explore - Fewwords",
  titleTemplate: null,
  description: "Browse public summaries created by the Fewwords community.",
  ogTitle: "Explore - Fewwords",
  ogDescription: "Browse public summaries created by the Fewwords community.",
  twitterTitle: "Explore - Fewwords",
  twitterDescription: "Browse public summaries created by the Fewwords community.",
});

interface ExploreSummary {
  summaryId: string
  title: string | null
  source: string
  essence: 'article' | 'youtube' | 'reddit'
  createdAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Pagination
const page = ref(1)
const { identity } = useUmamiIdentity()
const limit = 16

// Data
const summaries = ref<ExploreSummary[]>([])
const pagination = ref<Pagination>({ page: 1, limit: 16, total: 0, totalPages: 0 })

const loading = ref(false)

// Fetch data
async function fetchData() {
  loading.value = true
  try {
    const response = await $fetch<{ summaries: ExploreSummary[], pagination: Pagination }>(
      `/api/explore?page=${page.value}&limit=${limit}`
    )
    summaries.value = response.summaries
    pagination.value = response.pagination
  } catch (error) {
    console.error('Failed to fetch explore data:', error)
  } finally {
    loading.value = false
  }
}

// Watch for page changes
watch(page, () => {
  fetchData()
})

// Initial fetch
onMounted(() => {
  fetchData()
})

// Computed helpers
const showPagination = computed(() => {
  return pagination.value.total > 16
})
</script>

<template>
  <main class="flex-1">
    <section class="py-16 px-4">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-3xl font-bold text-foreground mb-8">
          Explore
        </h1>

        <!-- Loading state -->
        <div v-if="loading" class="text-center py-12">
          <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          <p class="text-sm text-muted-foreground mt-4">Loading...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="summaries.length === 0" class="text-center py-12">
          <p class="text-muted-foreground">
            No summaries yet. Be the first to create one!
          </p>
        </div>

        <!-- Summary list -->
        <div v-else class="space-y-3">
          <NuxtLink
            v-for="summary in summaries"
            :key="summary.summaryId"
            :to="`/app/${summary.summaryId}`"
            class="block border border-border rounded-lg p-4 hover:bg-muted/50 transition cursor-pointer"
          >
            <!-- Title -->
            <h3 
              class="font-medium text-foreground truncate mb-2 summary-title-list"
              v-html="parseInlineMarkdown(summary.title || 'Untitled')"
            />

            <!-- Metadata row -->
            <div class="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span>{{ formatDate(summary.createdAt) }}</span>
              <span>•</span>
              <span>{{ extractDomain(summary.source) }}</span>
            </div>

            <!-- Type badge -->
            <Badge variant="outline">
              {{ getEssenceLabel(summary.essence) }}
            </Badge>
          </NuxtLink>
        </div>

        <!-- Pagination -->
        <div v-if="showPagination && !loading" class="flex items-center justify-center gap-4 mt-8">
          <Button
            v-umami="{
              name: 'explore-prev-page',
              ...identity
            }"
            variant="outline"
            size="sm"
            :disabled="pagination.page === 1"
            @click="page--"
          >
            <Icon name="lucide:chevron-left" class="w-4 h-4" />
            Prev
          </Button>

          <span class="text-sm text-muted-foreground">
            Page {{ pagination.page }} of {{ pagination.totalPages }}
          </span>

          <Button
            v-umami="{
              name: 'explore-load-more',
              ...identity
            }"
            variant="outline"
            size="sm"
            :disabled="pagination.page === pagination.totalPages"
            @click="page++"
          >
            Next
            <Icon name="lucide:chevron-right" class="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.summary-title-list :deep(em) {
  font-style: italic;
}
.summary-title-list :deep(strong) {
  font-weight: 700;
}
.summary-title-list :deep(code) {
  font-family: var(--font-mono);
  background-color: hsl(var(--muted));
  padding: 0.1rem 0.3rem;
  border-radius: 0.2rem;
  font-size: 0.9em;
}
</style>
