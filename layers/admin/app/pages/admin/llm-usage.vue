
<script setup lang="ts">
import { ArrowLeft, Loader2, RefreshCw } from "lucide-vue-next";

import { createLlmUsageColumns } from "../../components/llm-usage/columns";
import DataTable from "../../components/llm-usage/data-table.vue";

import type { FlattenedLlmUsage } from "~~/server/lib/admin";

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

useHead({
  title: "LLM Usage | Admin",
});

const route = useRoute();
const router = useRouter();

// Get summaryId from query params to fetch a specific record
const summaryId = computed(() => (route.query.summaryId as string) || "");

// Pagination state
const page = ref(0);
const pageSize = ref(20);

// Server-side filter state
const search = ref("");
const debouncedSearch = ref("");
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

watch(search, (newVal) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = newVal;
  }, 300);
});

// Reset page when filters change
watch(debouncedSearch, () => {
  page.value = 0;
});

const { data, pending, error: _error, refresh } = await useFetch("/api/admin/llm-usage", {
  query: {
    page,
    pageSize,
    summaryId,
    search: debouncedSearch,
  },
  watch: [page, pageSize, summaryId, debouncedSearch],
  transform: (response) => {
    if (!response?.data) return response;
    return {
      ...response,
      data: response.data.map((item) => ({
        ...item,
        createdAt: new Date(item.createdAt as string),
      })),
    };
  },
});

const llmUsageData = computed(() => (data.value?.data ?? []) as FlattenedLlmUsage[]);
const meta = computed(() => data.value?.meta);

const dataTableRef = ref<{ openDrawer: (item: FlattenedLlmUsage) => void } | null>(null);

const columns = createLlmUsageColumns((item) => {
  dataTableRef.value?.openDrawer(item);
});

// Pagination handlers
const nextPage = () => {
  if (meta.value && page.value < meta.value.totalPages - 1) {
    page.value++;
  }
};

const prevPage = () => {
  if (page.value > 0) {
    page.value--;
  }
};

const goBack = () => {
  router.push("/admin/summaries");
};
</script>

<template>
  <div class="flex flex-col space-y-4 p-4 md:p-8">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <Button v-if="summaryId" variant="outline" size="icon" @click="goBack">
          <ArrowLeft class="h-4 w-4" />
        </Button>
        <div>
          <h1 class="text-2xl font-bold tracking-tight">LLM Usage</h1>
          <p class="text-sm text-muted-foreground">
            Detailed token and performance metrics for each AI call.
          </p>
        </div>
      </div>
    </div>

    <Separator />

    <!-- Filters -->
    <div class="flex items-center justify-between py-2 gap-2 flex-wrap">
      <Input
        v-if="!summaryId"
        v-model="search"
        placeholder="Search by Summary ID..."
        class="max-w-sm"
      />
      <div class="flex-grow" />
      <Button
        variant="outline"
        size="sm"
        :disabled="pending"
        @click="refresh"
      >
        <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': pending }" />
      </Button>
    </div>

    <!-- Data Table -->
    <div class="relative">
      <div v-if="pending" class="flex items-center justify-center py-20">
        <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
      <DataTable
        v-else-if="llmUsageData.length"
        ref="dataTableRef"
        :columns="columns"
        :data="llmUsageData"
      />
      <div v-else class="text-center py-20 text-muted-foreground">
        No LLM usage data found.
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between">
      <div class="text-sm text-muted-foreground">
        {{ meta?.total ?? 0 }} record(s)
      </div>
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="page === 0"
          @click="prevPage"
        >
          Previous
        </Button>
        <span class="text-sm text-muted-foreground">
          Page {{ page + 1 }} of {{ meta?.totalPages ?? 1 }}
        </span>
        <Button
          variant="outline"
          size="sm"
          :disabled="!meta || page >= meta.totalPages - 1"
          @click="nextPage"
        >
          Next
        </Button>
      </div>
    </div>
  </div>
</template>
