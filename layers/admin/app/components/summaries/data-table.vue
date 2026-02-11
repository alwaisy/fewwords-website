<script setup lang="ts" generic="TData, TValue">
import type { ColumnDef, ColumnFiltersState, SortingState, VisibilityState } from "@tanstack/vue-table"
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from "@tanstack/vue-table"
import { ChevronDown } from "lucide-vue-next"


import SummaryDrawer from "./summary-drawer.vue"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import TableBody from "@/components/ui/table/table-body.vue"
import TableCell from "@/components/ui/table/table-cell.vue"
import TableHead from "@/components/ui/table/table-head.vue"
import TableHeader from "@/components/ui/table/table-header.vue"
import TableRow from "@/components/ui/table/table-row.vue"
import Table from "@/components/ui/table/table.vue"
import { valueUpdater } from "@/components/ui/table/utils"
import type { Summary } from "~~/db/schema"

const props = defineProps<{
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}>()

// Filter states
const essenceFilter = ref<string>("")
const modelFilter = ref<string>("")
const statusFilter = ref<string>("")

const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({
  // Default visible columns: title, essence, source, totalTokens, actions
  summaryId: false,
  title: true,
  essence: true,
  source: true,
  totalTokens: true,
  model: false,
  status: false,
  createdAt: false,
  actions: true,
})

// Watch filter states and update column filters
watch([essenceFilter, modelFilter, statusFilter], () => {
  columnFilters.value = [
    { id: "essence", value: essenceFilter.value },
    { id: "model", value: modelFilter.value },
    { id: "status", value: statusFilter.value },
  ].filter((f) => f.value !== "")
})

// Drawer state
const selectedSummary = ref<Summary | null>(null)
const isDrawerOpen = ref(false)

const openDrawer = (summary: Summary) => {
  selectedSummary.value = summary
  isDrawerOpen.value = true
}

const table = useVueTable({
  get data() { return props.data },
  get columns() { return props.columns },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
  onColumnVisibilityChange: updaterOrValue => valueUpdater(updaterOrValue, columnVisibility),
  state: {
    get sorting() { return sorting.value },
    get columnFilters() { return columnFilters.value },
    get columnVisibility() { return columnVisibility.value },
  },
})

// Expose openDrawer for parent
defineExpose({ openDrawer })
</script>

<template>
  <div class="w-full">
    <div class="flex items-center justify-between py-4 gap-4 flex-wrap">
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Title filter -->
        <Input
          placeholder="Filter titles..."
          :model-value="(table.getColumn('title')?.getFilterValue() as string) ?? ''"
          class="max-w-[200px]"
          @update:model-value="table.getColumn('title')?.setFilterValue($event)"
        />

        <!-- Essence filter -->
        <div class="flex items-center gap-1">
          <span class="text-sm text-muted-foreground">Type:</span>
          <Badge
            v-if="essenceFilter"
            variant="secondary"
            class="cursor-pointer"
            @click="essenceFilter = ''"
          >
            {{ essenceFilter }} ✕
          </Badge>
          <select
            v-else
            class="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            @change="(e) => essenceFilter = (e.target as HTMLSelectElement).value"
          >
            <option value="">All types</option>
            <option value="article">Article</option>
            <option value="youtube">YouTube</option>
            <option value="reddit">Reddit</option>
          </select>
        </div>

        <!-- Model filter -->
        <div class="flex items-center gap-1">
          <span class="text-sm text-muted-foreground">Model:</span>
          <Input
            v-if="!modelFilter"
            placeholder="Filter model..."
            :model-value="modelFilter"
            class="h-9 w-[140px]"
            @update:model-value="modelFilter = $event"
          />
          <Badge
            v-else
            variant="secondary"
            class="cursor-pointer"
            @click="modelFilter = ''"
          >
            {{ modelFilter }} ✕
          </Badge>
        </div>

        <!-- Status filter -->
        <div class="flex items-center gap-1">
          <span class="text-sm text-muted-foreground">Status:</span>
          <Badge
            v-if="statusFilter"
            variant="secondary"
            class="cursor-pointer"
            @click="statusFilter = ''"
          >
            {{ statusFilter }} ✕
          </Badge>
          <select
            v-else
            class="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            @change="(e) => statusFilter = (e.target as HTMLSelectElement).value"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <!-- Clear all filters -->
        <Button
          v-if="essenceFilter || modelFilter || statusFilter"
          variant="ghost"
          size="sm"
          class="h-9"
          @click="essenceFilter = ''; modelFilter = ''; statusFilter = ''"
        >
          Clear filters
        </Button>
      </div>

      <!-- Column visibility dropdown -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" class="ml-auto">
            Columns <ChevronDown class="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuCheckboxItem
            v-for="column in table.getAllColumns().filter((column) => column.getCanHide())"
            :key="column.id"
            class="capitalize"
            :model-value="column.getIsVisible()"
            @update:model-value="(value) => {
              column.toggleVisibility(!!value)
            }"
          >
            {{ column.id }}
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
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

    <div class="flex items-center justify-end space-x-2 py-4">
      <div class="text-sm text-muted-foreground">
        {{ table.getFilteredRowModel().rows.length }} row(s).
      </div>
      <div class="space-x-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="!table.getCanPreviousPage()"
          @click="table.previousPage()"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="!table.getCanNextPage()"
          @click="table.nextPage()"
        >
          Next
        </Button>
      </div>
    </div>

    <SummaryDrawer
      v-if="selectedSummary"
      :summary="selectedSummary"
      :open="isDrawerOpen"
      @update:open="isDrawerOpen = $event"
    />
  </div>
</template>
