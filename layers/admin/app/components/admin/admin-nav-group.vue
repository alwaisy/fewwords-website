<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'

import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'

// Define types inline instead of importing from alias
type NavLink = {
  title: string
  url: string
  badge?: string
  icon?: string
  items?: never
}

type NavCollapsible = {
  title: string
  badge?: string
  icon?: string
  items: NavLink[]
  url?: never
}

type NavItem = NavCollapsible | NavLink

defineProps<{
  title: string
  items: NavItem[]
}>()

const route = useRoute()

const isActive = (item: NavLink) => {
  return route.path === item.url || route.path.startsWith(item.url + '/')
}

const hasActiveChild = (item: NavItem): boolean => {
  if ('url' in item) {
    return isActive(item as NavLink)
  }
  // For NavCollapsible, check if any child is active
  return (item as NavCollapsible).items.some((child) => isActive(child))
}
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel>{{ title }}</SidebarGroupLabel>
    <SidebarMenu>
      <template v-for="item in items" :key="item.title">
        <!-- Simple link -->
        <SidebarMenuItem v-if="'url' in item">
          <SidebarMenuButton as-child :is-active="isActive(item as NavLink)" :tooltip="item.title">
            <NuxtLink :to="item.url">
              <Icon v-if="item.icon" :name="item.icon" class="h-4 w-4" />
              <span>{{ item.title }}</span>
              <Badge v-if="item.badge" class="ml-auto rounded-full px-1 py-0 text-xs">
                {{ item.badge }}
              </Badge>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <!-- Collapsible with sub-items -->
        <Collapsible v-else as-child class="group/collapsible" :default-open="hasActiveChild(item)">
          <SidebarMenuItem>
            <CollapsibleTrigger as-child>
              <SidebarMenuButton :tooltip="item.title">
                <Icon v-if="item.icon" :name="item.icon" class="h-4 w-4" />
                <span>{{ item.title }}</span>
                <Badge v-if="item.badge" class="ml-auto rounded-full px-1 py-0 text-xs">
                  {{ item.badge }}
                </Badge>
                <ChevronRight class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 h-4 w-4" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent class="collapsible-content">
              <SidebarMenuSub>
                <SidebarMenuSubItem v-for="subItem in item.items" :key="subItem.title">
                  <SidebarMenuSubButton as-child :is-active="isActive(subItem)">
                    <NuxtLink :to="subItem.url">
                      <Icon v-if="subItem.icon" :name="subItem.icon" class="h-4 w-4" />
                      <span>{{ subItem.title }}</span>
                      <Badge v-if="subItem.badge" class="ml-auto rounded-full px-1 py-0 text-xs">
                        {{ subItem.badge }}
                      </Badge>
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
