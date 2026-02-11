<script setup lang="ts">
import { AlertCircle, Loader2, RefreshCw } from "lucide-vue-next";

import { createColumns } from "../../components/summaries/columns";
import DataTable from "../../components/summaries/data-table.vue";

import type { Summary } from "~~/db/schema";

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

const { data, pending, error, refresh } = await useFetch("/api/admin/summaries", {
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

// Ref to data table for accessing openDrawer
const dataTableRef = ref<{ openDrawer: (summary: Summary) => void } | null>(null)

// Create columns with drawer callback
const columns = createColumns((summary) => {
  dataTableRef.value?.openDrawer(summary)
})
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

    <DataTable v-else ref="dataTableRef" :columns="columns" :data="summaries" />
  </div>
</template>
