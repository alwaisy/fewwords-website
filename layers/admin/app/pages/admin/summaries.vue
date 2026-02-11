<script setup lang="ts">
import { AlertCircle, Loader2, RefreshCw } from "lucide-vue-next";

import { createColumns } from "../../components/summaries/columns";
import DataTable from "../../components/summaries/data-table.vue";

import type { Summary } from "~~/db/schema";

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

// Pagination state
const page = ref(0);
const pageSize = ref(25);

// Fetch summaries with server-side pagination
const { data, pending, error, refresh } = await useFetch("/api/admin/summaries", {
  query: {
    page,
    pageSize,
  },
  watch: [page, pageSize],
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

    <div v-if="pending" class="flex items-center justify-center py-20">
      <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
    </div>

    <div
      v-else-if="error"
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

    <div v-else class="space-y-4">
      <!-- Pagination info -->
      <div class="flex items-center justify-between text-sm">
        <span class="text-muted-foreground">
          Showing {{ meta?.total ?? 0 }} summaries
        </span>
        <span class="text-muted-foreground">
          Page {{ page + 1 }} of {{ meta?.totalPages ?? 1 }}
        </span>
      </div>

      <DataTable ref="dataTableRef" :columns="columns" :data="summaries" />

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
  </div>
</template>
