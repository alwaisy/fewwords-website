<script setup lang="ts">
import { Loader2, RefreshCw } from "lucide-vue-next";

import { createUserColumns } from "../../components/users/columns";
import type { AdminUser } from "../../components/users/columns";
import DataTable from "../../components/users/data-table.vue";

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

useHead({
  title: "Users | Admin",
});

// Pagination state
const page = ref(0);
const pageSize = ref(10);

// Server-side filter state
const search = ref("");
const roleFilter = ref("all");

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
const apiRoleFilter = computed(() => roleFilter.value === "all" ? "" : roleFilter.value);

// Reset page when filters change
watch([debouncedSearch, roleFilter], () => {
  page.value = 0;
});

// Fetch users with server-side pagination and filtering
const { data, pending, error, refresh } = await useFetch("/api/admin/users", {
  query: {
    page,
    pageSize,
    search: debouncedSearch,
    role: apiRoleFilter,
  },
  watch: [page, pageSize, debouncedSearch, apiRoleFilter],
  transform: (response) => {
    if (!response?.data) return response;
    return {
      ...response,
      data: response.data.map((item: Record<string, unknown>) => ({
        ...item,
        createdAt: new Date(item.createdAt as string),
      })),
    };
  },
});

const usersData = computed(() => (data.value?.data ?? []) as AdminUser[]);
const meta = computed(() => data.value?.meta);

const filterOptions = computed(() => data.value?.filterOptions ?? {
  roles: ["user", "admin"],
});

// Ref to data table for accessing openDrawer
const dataTableRef = ref<{ openDrawer: (user: AdminUser) => void } | null>(null);

// Create columns with drawer callback
const columns = createUserColumns((user) => {
  dataTableRef.value?.openDrawer(user);
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

// Clear all filters
const clearFilters = () => {
  search.value = "";
  roleFilter.value = "all";
};

const hasActiveFilters = computed(() => {
  return search.value !== "" || roleFilter.value !== "all";
});
</script>

<template>
  <div class="flex flex-col space-y-4 p-4 md:p-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Users</h1>
        <p class="text-sm text-muted-foreground">
          Manage and view all registered users.
        </p>
      </div>
      <Button v-if="error" variant="outline" size="sm" @click="refresh">
        <RefreshCw class="mr-2 h-4 w-4" />
        Retry
      </Button>
    </div>

    <Separator />

    <!-- Filters -->
    <div class="flex items-center justify-between py-2 gap-2 flex-wrap">
      <Input
        v-model="search"
        placeholder="Search by name, email, or username..."
        class="max-w-full flex-1 min-w-[150px]"
      />

      <div class="flex items-center gap-2">
        <!-- Role filter -->
        <Select v-model="roleFilter">
          <SelectTrigger class="w-[130px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem
              v-for="r in filterOptions.roles"
              :key="r"
              :value="r"
              class="capitalize"
            >
              {{ r }}
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
      </div>
    </div>

    <!-- Pagination info -->
    <div class="flex items-center justify-between text-sm">
      <span class="text-muted-foreground">
        <template v-if="pending && !usersData.length">Loading...</template>
        <template v-else>{{ meta?.total ?? 0 }} user(s)</template>
      </span>
      <span class="text-muted-foreground">
        Page {{ page + 1 }} of {{ meta?.totalPages ?? 1 }}
      </span>
    </div>

    <!-- Error state -->
    <div
      v-if="error && !usersData.length"
      class="rounded-md border border-destructive/50 bg-destructive/10 p-8 text-center"
    >
      <h3 class="text-lg font-semibold text-destructive mb-2">
        Failed to load users
      </h3>
      <p class="text-sm text-muted-foreground mb-4">
        {{ error.message }}
      </p>
      <Button variant="outline" @click="refresh">
        <RefreshCw class="mr-2 h-4 w-4" />
        Try Again
      </Button>
    </div>

    <!-- Table -->
    <div v-else class="relative">
      <!-- Loading overlay -->
      <div
        v-if="pending && usersData.length"
        class="absolute inset-0 bg-background/50 flex items-center justify-center z-10 rounded-md"
      >
        <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
      </div>

      <!-- Initial loading -->
      <div v-if="pending && !usersData.length" class="flex items-center justify-center py-20">
        <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
      </div>

      <!-- Table content -->
      <DataTable
        v-if="usersData.length"
        ref="dataTableRef"
        :columns="columns"
        :data="usersData"
      />
    </div>

    <!-- Pagination controls -->
    <div class="flex items-center justify-between">
      <div class="text-sm text-muted-foreground">
        {{ meta?.total ?? 0 }} user(s)
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
