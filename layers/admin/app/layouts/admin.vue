<script setup lang="ts">
// Admin layout with SidebarProvider and SidebarInset
// Based on shadcn-admin structure
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
// Components are auto-imported from the same layer
</script>

<template>
  <SidebarProvider>
    <AdminSidebar />
    <SidebarInset>
      <AdminHeader />
      <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
        <slot />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
