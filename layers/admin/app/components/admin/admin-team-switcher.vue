<script setup lang="ts">
import type { LucideIcon } from "lucide-vue-next";

type Team = {
  name: string;
  logo: LucideIcon;
  plan: string;
};

defineProps<{
  teams: Team[];
}>();

const modelValue = defineModel<Team>({ required: true });
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <SidebarMenuButton size="lg" class="pointer-events-none">
        <div
          class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
        >
          <component :is="modelValue.logo" class="size-4" />
        </div>
        <div class="grid flex-1 text-start text-sm leading-tight">
          <span class="truncate font-semibold">{{ modelValue.name }}</span>
          <!-- <span class="truncate text-xs">{{ modelValue.plan }}</span> -->
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
