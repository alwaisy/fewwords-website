<script setup lang="ts" generic="TData, TValue">
import type {
  ColumnDef,
  SortingState,
  VisibilityState,
} from "@tanstack/vue-table";
import {
  FlexRender,
  getCoreRowModel,
  getSortedRowModel,
  useVueTable,
} from "@tanstack/vue-table";

import SummaryDrawer, { type FullSummary } from "./summary-drawer.vue";

import { valueUpdater } from "@/components/ui/table/utils";

const props = defineProps<{
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  columnVisibility?: VisibilityState;
}>();

const emit = defineEmits<{
  "update:columnVisibility": [value: VisibilityState];
  "updated": [];
}>();

const sorting = ref<SortingState>([]);

// Use provided columnVisibility or default
const internalColumnVisibility = ref<VisibilityState>({
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
});

const columnVisibility = computed({
  get: () => props.columnVisibility ?? internalColumnVisibility.value,
  set: (val) => {
    internalColumnVisibility.value = val;
    emit("update:columnVisibility", val);
  },
});

// Drawer state
const selectedSummary = ref<FullSummary | null>(null);
const isDrawerOpen = ref(false);

const openDrawer = (summary: FullSummary) => {
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
  getSortedRowModel: getSortedRowModel(),
  onSortingChange: (updaterOrValue) => valueUpdater(updaterOrValue, sorting),
  state: {
    get sorting() {
      return sorting.value;
    },
    get columnVisibility() {
      return columnVisibility.value;
    },
  },
});

// Expose openDrawer for parent
defineExpose({ openDrawer });
</script>

<template>
  <div class="w-full">
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
      @updated="emit('updated')"
    />
  </div>
</template>
