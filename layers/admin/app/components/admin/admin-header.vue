<script setup lang="ts">
// Admin header component
// Based on shadcn-admin Header component
import { ChevronRight } from "lucide-vue-next";

const route = useRoute();

const breadcrumb = computed(() => {
  const path = route.path;
  if (path === "/admin" || path === "/admin/")
    return [{ title: "Dashboard", href: "/admin" }];

  const parts = path.split("/").filter(Boolean);
  const items: Array<{ title: string; href?: string }> = [
    { title: "Dashboard", href: "/admin" },
  ];

  if (parts.length > 1 && parts[1]) {
    items.push({ title: parts[1].charAt(0).toUpperCase() + parts[1].slice(1) });
  }

  return items;
});
</script>

<template>
  <header
    class="sticky top-0 z-50 flex h-16 w-full items-center gap-2 border-b bg-background/95 backdrop-blur supports-[bg-blend]:supports:bg-background/60"
  >
    <div class="flex h-full w-full items-center gap-3 px-4 sm:gap-4">
      <SidebarTrigger variant="ghost" class="max-md:scale-125" />
      <Separator orientation="vertical" class="h-6" />
      <div class="flex flex-1 items-center gap-1 text-sm">
        <template v-for="(item, index) in breadcrumb" :key="index">
          <ChevronRight
            v-if="index > 0"
            class="h-4 w-4 text-muted-foreground"
          />
          <component
            :is="item.href ? 'NuxtLink' : 'span'"
            :to="item.href"
            :class="[
              index === breadcrumb.length - 1
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground',
            ]"
          >
            {{ item.title }}
          </component>
        </template>
      </div>
      <div class="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>
