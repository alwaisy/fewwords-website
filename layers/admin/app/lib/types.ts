// Admin layer types - based on shadcn-admin structure

export type User = {
  name: string
  email: string
  avatar?: string
}

export type Team = {
  name: string
  logo: string // Icon name for @nuxt/icon
  plan: string
}

export type BaseNavItem = {
  title: string
  badge?: string
  icon?: string // Icon name for @nuxt/icon
}

export type NavLink = BaseNavItem & {
  url: string
  items?: never
}

export type NavCollapsible = BaseNavItem & {
  items: NavLink[]
  url?: never
}

export type NavItem = NavCollapsible | NavLink

export type NavGroup = {
  title: string
  items: NavItem[]
}

export type SidebarData = {
  user: User
  teams: Team[]
  navGroups: NavGroup[]
}

export type StatCard = {
  title: string
  value: string | number
  change: string
  icon: string
  trend?: "up" | "down" | "neutral"
}
