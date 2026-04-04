<script setup lang="ts">
type NavLink = {
  title: string;
  url: string;
  badge?: string;
  icon?: string;
  items?: never;
};

type NavCollapsible = {
  title: string;
  badge?: string;
  icon?: string;
  items: NavLink[];
  url?: never;
};

type NavItem = NavCollapsible | NavLink;

defineProps<{
  title: string;
  items: NavItem[];
}>();

const route = useRoute();

// Track current path reactively
const currentPath = computed(() => route.path);

const isActive = (item: NavLink) => {
  return currentPath.value === item.url;
};

const isNavLink = (item: NavItem): item is NavLink => {
  return "url" in item;
};

const hasActiveChild = (item: NavItem): boolean => {
  if (isNavLink(item)) {
    return isActive(item);
  }
  // For NavCollapsible, check if any child is active
  return item.items.some((child) => isActive(child));
};
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel v-if="title">{{ title }}</SidebarGroupLabel>
    <div v-else class="h-4" />
    <SidebarMenu>
      <template v-for="item in items" :key="item.title">
        <!-- Simple link -->
        <SidebarMenuItem v-if="isNavLink(item)">
          <SidebarMenuButton
            :is-active="isActive(item)"
            :tooltip="item.title"
            as="a"
            :href="item.url"
            @click.prevent="navigateTo(item.url)"
          >
                <Icon v-if="item.icon" :name="item.icon" class="h-4 w-4" />
            <span>{{ item.title }}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <!-- Collapsible with sub-items -->
        <Collapsible
          v-else
          as-child
          class="group/collapsible"
          :default-open="hasActiveChild(item)"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger as-child>
              <SidebarMenuButton :tooltip="item.title">
            <Icon v-if="item.icon" :name="item.icon" class="h-4 w-4" />
                <span>{{ item.title }}</span>
                <Icon
name="lucide:chevron-right"
                  class="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90"
                />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem
                  v-for="subItem in item.items"
                  :key="subItem.title"
                >
                  <SidebarMenuSubButton as-child :is-active="isActive(subItem)">
                    <NuxtLink :to="subItem.url">
                      <component
                        :is="subItem.icon"
                        v-if="subItem.icon"
                        class="h-4 w-4"
                      />
                      <span>{{ subItem.title }}</span>
                    </NuxtLink>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </template>
    </SidebarMenu>
  </SidebarGroup>
</template>
