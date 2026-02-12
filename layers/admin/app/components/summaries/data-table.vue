<script setup lang="ts" generic="TData, TValue">
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/vue-table";
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from "@tanstack/vue-table";
import { ChevronDown } from "lucide-vue-next";

import SummaryDrawer from "./summary-drawer.vue";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import TableBody from "@/components/ui/table/table-body.vue";
import TableCell from "@/components/ui/table/table-cell.vue";
import TableHead from "@/components/ui/table/table-head.vue";
import TableHeader from "@/components/ui/table/table-header.vue";
import TableRow from "@/components/ui/table/table-row.vue";
import Table from "@/components/ui/table/table.vue";
import { valueUpdater } from "@/components/ui/table/utils";
import type { Summary } from "~~/db/schema";

const props = defineProps<{
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}>();

// Filter states
const essenceFilter = ref<string>("all");
const modelFilter = ref<string>("all");
const statusFilter = ref<string>("all");

// Dynamically extract unique models from data
const uniqueModels = computed(() => {
  const models = new Set<string>();
  props.data.forEach((item) => {
    const summary = item as Summary;
    if (summary.model && typeof summary.model === "string") {
      models.add(summary.model);
    }
  });
  return Array.from(models).sort();
});

// Dynamically extract unique statuses from data
const uniqueStatuses = computed(() => {
  const statuses = new Set<string>();
  props.data.forEach((item) => {
    const summary = item as Summary;
    if (summary.status && typeof summary.status === "string") {
      statuses.add(summary.status);
    }
  });
  return Array.from(statuses).sort();
});

// Dynamically extract unique essences from data
const uniqueEssences = computed(() => {
  const essences = new Set<string>();
  props.data.forEach((item) => {
    const summary = item as Summary;
    if (summary.essence && typeof summary.essence === "string") {
      essences.add(summary.essence);
    }
  });
  return Array.from(essences).sort();
});

const sorting = ref<SortingState>([]);
const columnFilters = ref<ColumnFiltersState>([]);
const columnVisibility = ref<VisibilityState>({
  // Default visible columns: summaryId, title, essence, source, totalTokens, actions
  summaryId: true,
  title: true,
  essence: true,
  source: true,
  totalTokens: true,
  model: false,
  status: false,
  createdAt: false,
  actions: true,
});

// Pagination state
const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});

// Watch filter states and update column filters
watch([essenceFilter, modelFilter, statusFilter], () => {
  columnFilters.value = [
    {
      id: "essence",
      value: essenceFilter.value === "all" ? "" : essenceFilter.value,
    },
    {
      id: "model",
      value: modelFilter.value === "all" ? "" : modelFilter.value,
    },
    {
      id: "status",
      value: statusFilter.value === "all" ? "" : statusFilter.value,
    },
  ].filter((f) => f.value !== "");
});

// Drawer state
const selectedSummary = ref<Summary | null>(null);
const isDrawerOpen = ref(false);

const openDrawer = (summary: Summary) => {
  selectedSummary.value = summary;
  isDrawerOpen.value = true;
};

const table = useVueTable({
  get data() {
    return props.data;
  },
  get columns() {
    return props.columns;
  },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  onSortingChange: (updaterOrValue) => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: (updaterOrValue) =>
    valueUpdater(updaterOrValue, columnFilters),
  onColumnVisibilityChange: (updaterOrValue) =>
    valueUpdater(updaterOrValue, columnVisibility),
  onPaginationChange: (updaterOrValue) =>
    valueUpdater(updaterOrValue, pagination),
  state: {
    get sorting() {
      return sorting.value;
    },
    get columnFilters() {
      return columnFilters.value;
    },
    get columnVisibility() {
      return columnVisibility.value;
    },
    get pagination() {
      return pagination.value;
    },
  },
});

// Expose openDrawer for parent
defineExpose({ openDrawer });
</script>

<template>
  <div class="w-full">
    <div class="flex items-center justify-between py-4 gap-2 flex-wrap">
      <!-- Search - gets max space -->
      <Input
        placeholder="Filter titles..."
        :model-value="
          (table.getColumn('title')?.getFilterValue() as string) ?? ''
        "
        class="max-w-full flex-1 min-w-[150px]"
        @update:model-value="table.getColumn('title')?.setFilterValue($event)"
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
          v-if="
            essenceFilter !== 'all' ||
            modelFilter !== 'all' ||
            statusFilter !== 'all'
          "
          variant="ghost"
          size="sm"
          class="h-9"
          @click="
            essenceFilter = 'all';
            modelFilter = 'all';
            statusFilter = 'all';
          "
        >
          Clear
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
              v-for="column in table
                .getAllColumns()
                .filter((column) => column.getCanHide())"
              :key="column.id"
              class="capitalize"
              :model-value="column.getIsVisible()"
              @update:model-value="
                (value) => {
                  column.toggleVisibility(!!value);
                }
              "
            >
              {{ column.id }}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <TableHead v-for="header in headerGroup.headers" :key="header.id">
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows?.length">
            <TableRow v-for="row in table.getRowModel().rows" :key="row.id">
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </TableCell>
            </TableRow>
          </template>
          <TableRow v-else>
            <TableCell :colspan="columns.length" class="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <SummaryDrawer
      v-if="selectedSummary"
      :summary="selectedSummary"
      :open="isDrawerOpen"
      @update:open="isDrawerOpen = $event"
    />
  </div>
</template>
