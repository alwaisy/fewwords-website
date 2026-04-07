<script setup lang="ts">
import { useUmamiIdentity } from '~/composables/use-umami-identity'
import { extractDomain, formatDate, getEssenceLabel } from '~/lib/summary'

const siteUrl = useSiteConfig().url;

useHead({
  link: [{ rel: "canonical", href: `${siteUrl}/library` }],
});

useSeoMeta({
  title: "Library - Fewwords",
  titleTemplate: null,
  description: "Your saved and created summaries in Fewwords.",
  ogTitle: "Library - Fewwords",
  ogDescription: "Your saved and created summaries in Fewwords.",
  twitterTitle: "Library - Fewwords",
  twitterDescription: "Your saved and created summaries in Fewwords.",
});

definePageMeta({
  middleware: 'auth'
});

// Add the identity composable
const { identity } = useUmamiIdentity()

interface LibrarySummary {
  summaryId: string
  title: string | null
  source: string
  essence: 'article' | 'youtube' | 'reddit'
  createdAt: string
  status: string
  savedAt?: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Tabs: 'my-summaries' | 'saved'
const activeTab = ref<'my-summaries' | 'saved'>('my-summaries')

// Pagination
const page = ref(1)
const limit = 16

// Data
const mySummaries = ref<LibrarySummary[]>([])
const savedSummaries = ref<LibrarySummary[]>([])
const myPagination = ref<Pagination>({ page: 1, limit: 16, total: 0, totalPages: 0 })
const savedPagination = ref<Pagination>({ page: 1, limit: 16, total: 0, totalPages: 0 })

const loading = ref(false)

// Fetch data based on active tab
async function fetchData() {
  loading.value = true
  try {
    if (activeTab.value === 'my-summaries') {
      const response = await $fetch(`/api/library/my-summaries?page=${page.value}&limit=${limit}`)
      mySummaries.value = response.summaries
      myPagination.value = response.pagination
    } else {
      const response = await $fetch(`/api/library/saved?page=${page.value}&limit=${limit}`)
      savedSummaries.value = response.summaries
      savedPagination.value = response.pagination
    }
  } catch (error) {
    console.error('Failed to fetch library data:', error)
  } finally {
    loading.value = false
  }
}

// Watch for tab changes
watch(activeTab, () => {
  page.value = 1
  fetchData()
})

// Watch for page changes
watch(page, () => {
  fetchData()
})

// Initial fetch
onMounted(() => {
  fetchData()
})

// Computed helpers
const currentData = computed(() => {
  return activeTab.value === 'my-summaries' ? mySummaries.value : savedSummaries.value
})

const currentPagination = computed(() => {
  return activeTab.value === 'my-summaries' ? myPagination.value : savedPagination.value
})

const showPagination = computed(() => {
  return currentPagination.value.total > 16
})

// Navigate to summary
function goToSummary(summaryId: string) {
  navigateTo(`/app/${summaryId}`)
}
</script>

<template>
  <main class="flex-1">
    <section class="py-16 px-4">
      <div class="max-w-2xl mx-auto">
        <div class="flex items-center justify-between mb-8">
          <h1 class="text-3xl font-bold text-foreground">
            Library
          </h1>
          <NuxtLink to="/app">
            <Button variant="default" size="sm">
              <Icon name="lucide:plus" class="w-4 h-4 mr-1" />
              Do another
            </Button>
          </NuxtLink>
        </div>

        <!-- Tabs -->
        <div class="flex gap-4 border-b border-border mb-6">
          <button
            v-umami="'library-tab-mine'"
            :class="[
              'pb-3 px-1 text-sm font-medium transition-colors',
              activeTab === 'my-summaries'
                ? 'text-foreground border-b-2 border-foreground'
                : 'text-muted-foreground hover:text-foreground'
            ]"
            @click="activeTab = 'my-summaries'"
          >
            My Summaries
          </button>
          <button
            v-umami="'library-tab-saved'"
            :class="[
              'pb-3 px-1 text-sm font-medium transition-colors',
              activeTab === 'saved'
                ? 'text-foreground border-b-2 border-foreground'
                : 'text-muted-foreground hover:text-foreground'
            ]"
            @click="activeTab = 'saved'"
          >
            Saved
          </button>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="text-center py-12">
          <Icon name="lucide:loader-2" class="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          <p class="text-sm text-muted-foreground mt-4">Loading...</p>
        </div>

        <!-- Empty state -->
        <div v-else-if="currentData.length === 0" class="text-center py-12">
          <p class="text-muted-foreground">
            {{ activeTab === 'my-summaries'
              ? "You haven't created any summaries yet."
              : "No saved summaries. Save summaries to read later." }}
          </p>
        </div>

        <!-- Summary list -->
        <div v-else class="space-y-3">
           <div
             v-for="summary in currentData"
             :key="summary.summaryId"
             v-umami="{
               name: 'library-summary-click',
               essence: summary.essence,
               tab: activeTab,
               ...identity
             }"
             class="border border-border rounded-lg p-4 hover:bg-muted/50 transition cursor-pointer"
             @click="goToSummary(summary.summaryId)"
           >
            <!-- Title -->
            <h3 class="font-medium text-foreground truncate mb-2">
              {{ summary.title || 'Untitled' }}
            </h3>

            <!-- Metadata row -->
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{{ formatDate(summary.createdAt) }}</span>
              <span>•</span>
              <span>{{ extractDomain(summary.source) }}</span>
            </div>

            <!-- Badges row -->
            <div class="flex items-center gap-2 mt-2">
              <Badge variant="secondary">
                {{ activeTab === 'my-summaries' ? 'My Summary' : 'Saved' }}
              </Badge>
              <Badge variant="outline">
                {{ getEssenceLabel(summary.essence) }}
              </Badge>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="showPagination && !loading" class="flex items-center justify-center gap-4 mt-8">
          <Button
            v-umami="'library-prev-page'"
            variant="outline"
            size="sm"
            :disabled="currentPagination.page === 1"
            @click="page--"
          >
            <Icon name="lucide:chevron-left" class="w-4 h-4" />
            Prev
          </Button>

          <span class="text-sm text-muted-foreground">
            Page {{ currentPagination.page }} of {{ currentPagination.totalPages }}
          </span>

          <Button
            v-umami="'library-next-page'"
            variant="outline"
            size="sm"
            :disabled="currentPagination.page === currentPagination.totalPages"
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
