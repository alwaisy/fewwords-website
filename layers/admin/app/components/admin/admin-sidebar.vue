<script setup lang="ts">
import { ref } from 'vue'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'

// Define types inline for sidebar data
type User = {
  name: string
  email: string
  avatar?: string
}

type Team = {
  name: string
  logo: string
  plan: string
}

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

type NavGroup = {
  title: string
  items: NavItem[]
}

type SidebarData = {
  user: User
  teams: Team[]
  navGroups: NavGroup[]
}

// Sidebar data - could be moved to a separate file
const sidebarData: SidebarData = {
  user: {
    name: "Admin",
    email: "admin@fewwords.app",
    avatar: "/avatars/admin.jpg",
  },
  teams: [
    {
      name: "Fewwords Admin",
      logo: "lucide:command",
      plan: "Pro",
    },
  ],
  navGroups: [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          url: "/admin",
          icon: "lucide:layout-dashboard",
        },
        {
          title: "Summaries",
          url: "/admin/summaries",
          icon: "lucide:file-text",
        },
        {
          title: "Users",
          url: "/admin/users",
          icon: "lucide:users",
        },
      ],
    },
    {
      title: "Analytics",
      items: [
        {
          title: "Content Stats",
          url: "/admin/content-stats",
          icon: "lucide:bar-chart-3",
        },
        {
          title: "Token Usage",
          url: "/admin/token-usage",
          icon: "lucide:coins",
        },
        {
          title: "Costs",
          url: "/admin/costs",
          icon: "lucide:credit-card",
        },
      ],
    },
    {
      title: "Management",
      items: [
        {
          title: "Domains",
          url: "/admin/domains",
          icon: "lucide:globe",
        },
        {
          title: "Channels",
          url: "/admin/channels",
          icon: "lucide:youtube",
        },
        {
          title: "Categories",
          url: "/admin/categories",
          icon: "lucide:tags",
        },
        {
          title: "Errors",
          url: "/admin/errors",
          icon: "lucide:alert-circle",
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          title: "Profile",
          url: "/admin/settings/profile",
          icon: "lucide:user-cog",
        },
        {
          title: "Appearance",
          url: "/admin/settings/appearance",
          icon: "lucide:palette",
        },
        {
          title: "Notifications",
          url: "/admin/settings/notifications",
          icon: "lucide:bell",
        },
      ],
    },
  ],
}

const activeTeam = ref(sidebarData.teams[0]!)

// Also make sure we have at least one team
if (!sidebarData.teams.length) {
  sidebarData.teams.push({
    name: "Default",
    logo: "lucide:command",
    plan: "Free",
  })
}
</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <AdminTeamSwitcher v-model="activeTeam" :teams="sidebarData.teams" />
    </SidebarHeader>
    <SidebarContent>
      <AdminNavGroup
        v-for="group in sidebarData.navGroups"
        :key="group.title"
        :title="group.title"
        :items="group.items"
      />
    </SidebarContent>
    <SidebarFooter>
      <AdminNavUser :user="sidebarData.user" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
