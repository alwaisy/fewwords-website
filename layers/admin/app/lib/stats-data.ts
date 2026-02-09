import type { StatCard } from "./types"

export const statsCards: StatCard[] = [
  {
    title: "Total Summaries",
    value: "12,345",
    change: "+20.1% from last month",
    icon: "lucide:file-text",
    trend: "up",
  },
  {
    title: "Total Users",
    value: "1,234",
    change: "+180.1% from last month",
    icon: "lucide:users",
    trend: "up",
  },
  {
    title: "Token Usage",
    value: "2.3M",
    change: "+15% from last month",
    icon: "lucide:coins",
    trend: "up",
  },
  {
    title: "Success Rate",
    value: "98.5%",
    change: "-0.3% from last month",
    icon: "lucide:check-circle",
    trend: "down",
  },
]

export const recentSummaries = [
  {
    id: "few-abc123",
    title: "Introduction to TypeScript",
    essence: "article",
    status: "completed",
    createdAt: "2 minutes ago",
  },
  {
    id: "few-def456",
    title: "Building a React Native App",
    essence: "youtube",
    status: "completed",
    createdAt: "5 minutes ago",
  },
  {
    id: "few-ghi789",
    title: "Reddit discussion on AI trends",
    essence: "reddit",
    status: "completed",
    createdAt: "12 minutes ago",
  },
  {
    id: "few-jkl012",
    title: "Understanding Vue 3 Composition API",
    essence: "article",
    status: "processing",
    createdAt: "1 hour ago",
  },
  {
    id: "few-mno345",
    title: "Nuxt 4 Tutorial for Beginners",
    essence: "youtube",
    status: "failed",
    createdAt: "2 hours ago",
  },
]

export const contentStats = [
  {
    name: "Articles",
    value: 8234,
    percentage: 67,
    color: "bg-blue-500",
  },
  {
    name: "YouTube",
    value: 3456,
    percentage: 28,
    color: "bg-red-500",
  },
  {
    name: "Reddit",
    value: 655,
    percentage: 5,
    color: "bg-orange-500",
  },
]

export const tokenUsageByProvider = [
  {
    name: "OpenRouter",
    value: 1.2,
    percentage: 52,
    color: "bg-purple-500",
  },
  {
    name: "OpenAI",
    value: 0.8,
    percentage: 35,
    color: "bg-green-500",
  },
  {
    name: "Anthropic",
    value: 0.3,
    percentage: 13,
    color: "bg-orange-500",
  },
]
