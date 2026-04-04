import type { SidebarData } from "./types"

export const sidebarData: SidebarData = {
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
          title: "Social",
          url: "/admin/social",
          icon: "lucide:share-2",
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
