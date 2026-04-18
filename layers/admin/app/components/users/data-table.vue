<script setup lang="ts" generic="TData, TValue">
import type {
  ColumnDef,
  SortingState,
} from "@tanstack/vue-table";
import {
  FlexRender,
  getCoreRowModel,
  getSortedRowModel,
  useVueTable,
} from "@tanstack/vue-table";

import type { AdminUser } from "./columns";
import UserDrawer from "./user-drawer.vue";

import { valueUpdater } from "@/components/ui/table/utils";

const props = defineProps<{
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}>();

const sorting = ref<SortingState>([]);

// Drawer state
const selectedUser = ref<AdminUser | null>(null);
const isDrawerOpen = ref(false);

const emit = defineEmits<{
  "updated": [];
}>();

const openDrawer = (user: AdminUser) => {
  selectedUser.value = user;
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
              No users found.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <UserDrawer
      v-if="selectedUser"
      :user="selectedUser"
      :open="isDrawerOpen"
      @update:open="isDrawerOpen = $event"
      @updated="emit('updated')"
    />
  </div>
</template>
