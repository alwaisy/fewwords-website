<script setup lang="ts"></script>

<template>
  <SidebarProvider>
    <AdminSidebar />
    <SidebarInset>
      <AdminHeader />
      <div class="mx-auto flex max-w-5xl w-full flex-1 flex-col gap-4 p-4 pt-0">
        <slot />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
