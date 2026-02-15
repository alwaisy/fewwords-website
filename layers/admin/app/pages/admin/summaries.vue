<script setup lang="ts">
import { AlertCircle, ChevronDown, Loader2, RefreshCw } from "lucide-vue-next";

import { createColumns } from "../../components/summaries/columns";
import DataTable from "../../components/summaries/data-table.vue";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import type { Summary } from "~~/db/schema";

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

useHead({
  title: "Summaries | Admin",
});

// Pagination state
const page = ref(0);
const pageSize = ref(10);

// Server-side filter state (use "all" for Select compatibility, convert to "" for API)
const search = ref("");
const essenceFilter = ref("all");
const statusFilter = ref("all");
const modelFilter = ref("all");

// Debounced search for API calls
const debouncedSearch = ref("");
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

watch(search, (newVal) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = newVal;
  }, 300);
});

// Computed values that convert "all" to "" for API
const apiEssenceFilter = computed(() => essenceFilter.value === "all" ? "" : essenceFilter.value);
const apiStatusFilter = computed(() => statusFilter.value === "all" ? "" : statusFilter.value);
const apiModelFilter = computed(() => modelFilter.value === "all" ? "" : modelFilter.value);

// Reset page when filters change
watch([debouncedSearch, essenceFilter, statusFilter, modelFilter], () => {
  page.value = 0;
});

// Fetch summaries with server-side pagination and filtering
// Keep previous data while loading to avoid flashing
const { data, pending, error, refresh } = await useFetch("/api/admin/summaries", {
  query: {
    page,
    pageSize,
    search: debouncedSearch,
    essence: apiEssenceFilter,
    status: apiStatusFilter,
    model: apiModelFilter,
  },
  watch: [page, pageSize, debouncedSearch, apiEssenceFilter, apiStatusFilter, apiModelFilter],
  keepalive: true,
  transform: (response) => {
    if (!response?.data) return response
    return {
      ...response,
      data: response.data.map((item) => ({
        ...item,
        createdAt: new Date(item.createdAt as string),
        completedAt: item.completedAt ? new Date(item.completedAt as string) : null,
      })),
    }
  },
})

const summaries = computed(() => (data.value?.data ?? []) as Summary[])
const meta = computed(() => data.value?.meta)

// Filter options from API
const filterOptions = computed(() => data.value?.filterOptions ?? {
  essences: ["article", "youtube", "reddit"],
  statuses: ["pending", "processing", "completed", "failed"],
  models: [],
})

const uniqueEssences = computed(() => filterOptions.value.essences)
const uniqueStatuses = computed(() => filterOptions.value.statuses)
const uniqueModels = computed(() => filterOptions.value.models)

// Ref to data table for accessing openDrawer
const dataTableRef = ref<{ openDrawer: (summary: Summary) => void } | null>(null)

// Create columns with drawer callback
const columns = createColumns((summary) => {
  dataTableRef.value?.openDrawer(summary)
})

// Pagination handlers
const nextPage = () => {
  if (meta.value && page.value < meta.value.totalPages - 1) {
    page.value++
  }
}

const prevPage = () => {
  if (page.value > 0) {
    page.value--
  }
}

// Clear all filters
const clearFilters = () => {
  search.value = ""
  essenceFilter.value = "all"
  statusFilter.value = "all"
  modelFilter.value = "all"
}

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return (
    search.value !== "" ||
    essenceFilter.value !== "all" ||
    statusFilter.value !== "all" ||
    modelFilter.value !== "all"
  );
})

// Column visibility state
const columnVisibility = ref({
  summaryId: true,
  title: true,
  essence: true,
  source: false,
  holisticTotalTokens: true,
  holisticTotalTime: true,
  model: false,
  status: false,
  createdAt: false,
  actions: true,
})

// For dropdown menu
const columnsVisibility = computed(() => {
  return Object.entries(columnVisibility.value).map(([id, isVisible]) => ({
    id,
    isVisible,
  }))
})

const toggleColumnVisibility = (id: string, value: boolean) => {
  columnVisibility.value[id as keyof typeof columnVisibility.value] = value
}
</script>

<template>
  <div class="flex flex-col space-y-4 p-4 md:p-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Summaries</h1>
        <p class="text-sm text-muted-foreground">
          Manage and view all summaries in the system.
        </p>
      </div>
      <Button v-if="error" variant="outline" size="sm" @click="refresh">
        <RefreshCw class="mr-2 h-4 w-4" />
        Retry
      </Button>
    </div>

    <Separator />

    <!-- Filters - always visible -->
    <div class="flex items-center justify-between py-2 gap-2 flex-wrap">
      <!-- Search - gets max space -->
      <Input
        v-model="search"
        placeholder="Search titles or IDs..."
        class="max-w-full flex-1 min-w-[150px]"
      />

      <div class="flex items-center gap-2">
        <!-- Essence filter (Type) -->
        <Select v-model="essenceFilter">
          <SelectTrigger class="w-[130px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem
              v-for="essence in uniqueEssences"
              :key="essence"
              :value="essence"
              class="capitalize"
            >
              {{ essence }}
            </SelectItem>
          </SelectContent>
        </Select>

        <!-- Status filter -->
        <Select v-model="statusFilter">
          <SelectTrigger class="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem
              v-for="status in uniqueStatuses"
              :key="status"
              :value="status"
            >
              {{ status }}
            </SelectItem>
          </SelectContent>
        </Select>

        <!-- Model filter -->
        <Select v-model="modelFilter">
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All models</SelectItem>
            <SelectItem
              v-for="model in uniqueModels"
              :key="model"
              :value="model"
            >
              {{ model }}
            </SelectItem>
          </SelectContent>
        </Select>

        <!-- Clear all filters -->
        <Button
          v-if="hasActiveFilters"
          variant="ghost"
          size="sm"
          class="h-9"
          @click="clearFilters"
        >
          Clear
        </Button>

        <!-- Refresh button -->
        <Button
          variant="outline"
          size="sm"
          :disabled="pending"
          @click="refresh"
        >
          <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': pending }" />
        </Button>

        <!-- Column visibility dropdown -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" size="sm">
              Columns <ChevronDown class="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              v-for="column in columnsVisibility"
              :key="column.id"
              class="capitalize"
              :model-value="column.isVisible"
              @update:model-value="toggleColumnVisibility(column.id, $event)"
            >
              {{ column.id }}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <!-- Pagination info -->
    <div class="flex items-center justify-between text-sm">
      <span class="text-muted-foreground">
        <template v-if="pending && !summaries.length">Loading...</template>
        <template v-else>Showing {{ meta?.total ?? 0 }} summaries</template>
      </span>
      <span class="text-muted-foreground">
        Page {{ page + 1 }} of {{ meta?.totalPages ?? 1 }}
      </span>
    </div>

    <!-- Error state -->
    <div
      v-if="error && !summaries.length"
      class="rounded-md border border-destructive/50 bg-destructive/10 p-8 text-center"
    >
      <AlertCircle class="mx-auto h-10 w-10 text-destructive mb-4" />
      <h3 class="text-lg font-semibold text-destructive mb-2">
        Failed to load summaries
      </h3>
      <p class="text-sm text-muted-foreground mb-4">
        {{ error.message }}
      </p>
      <Button variant="outline" @click="refresh">
        <RefreshCw class="mr-2 h-4 w-4" />
        Try Again
      </Button>
    </div>

    <!-- Table - shows loading overlay or content -->
    <div v-else class="relative">
      <!-- Loading overlay -->
      <div
        v-if="pending && summaries.length"
        class="absolute inset-0 bg-background/50 flex items-center justify-center z-10 rounded-md"
      >
        <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
      </div>

      <!-- Initial loading -->
      <div v-if="pending && !summaries.length" class="flex items-center justify-center py-20">
        <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
      </div>

      <!-- Table content -->
      <DataTable
        v-if="summaries.length"
        ref="dataTableRef"
        :columns="columns"
        :data="summaries"
        :column-visibility="columnVisibility"
        @update:column-visibility="(v) => columnVisibility = v as typeof columnVisibility"
      />
    </div>

    <!-- Pagination controls -->
    <div class="flex items-center justify-between">
      <div class="text-sm text-muted-foreground">
        {{ meta?.total ?? 0 }} summary(s)
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
