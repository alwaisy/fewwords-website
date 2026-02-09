<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

definePageMeta({
  layout: "admin",
})

// Mock stats data - will be replaced with API calls later
const statsCards = [
  {
    title: "Total Summaries",
    value: "12,345",
    change: "+20.1% from last month",
    icon: "lucide:file-text",
  },
  {
    title: "Total Users",
    value: "1,234",
    change: "+180.1% from last month",
    icon: "lucide:users",
  },
  {
    title: "Token Usage",
    value: "2.3M",
    change: "+15% from last month",
    icon: "lucide:coins",
  },
  {
    title: "Success Rate",
    value: "98.5%",
    change: "-0.3% from last month",
    icon: "lucide:check-circle",
  },
]

const recentSummaries = [
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

const essenceIcons: Record<string, string> = {
  article: "lucide:file-text",
  youtube: "lucide:youtube",
  reddit: "lucide:message-square",
}

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  completed: "default",
  processing: "secondary",
  failed: "destructive",
}

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  return statusVariants[status] || "default"
}
</script>

<template>
  <div class="flex-1 space-y-4">
    <!-- Page Header -->
    <div class="flex items-center justify-between space-y-2">
      <h1 class="text-2xl font-bold tracking-tight">Dashboard</h1>
      <div class="flex items-center space-x-2">
        <Button size="sm">Download</Button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card v-for="stat in statsCards" :key="stat.title">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            {{ stat.title }}
          </CardTitle>
          <Icon :name="stat.icon" class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stat.value }}</div>
          <p class="text-xs text-muted-foreground">
            {{ stat.change }}
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-7">
      <!-- Chart Section -->
      <Card class="col-span-1 lg:col-span-4">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>
            Summary statistics for the current period
          </CardDescription>
        </CardHeader>
        <CardContent class="pl-2">
          <div class="h-[300px] w-full flex items-center justify-center text-muted-foreground border rounded-lg border-dashed">
            <div class="text-center">
              <Icon name="lucide:bar-chart-3" class="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Chart placeholder</p>
              <p class="text-sm">Analytics chart will be displayed here</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Recent Summaries -->
      <Card class="col-span-1 lg:col-span-3">
        <CardHeader>
          <CardTitle>Recent Summaries</CardTitle>
          <CardDescription>
            You made {{ recentSummaries.length }} summaries recently.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="summary in recentSummaries.slice(0, 5)"
              :key="summary.id"
              class="flex items-center"
            >
              <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Icon
                  :name="essenceIcons[summary.essence] || 'lucide:file'"
                  class="h-4 w-4"
                />
              </div>
              <div class="ml-4 space-y-1 flex-1">
                <p class="text-sm font-medium leading-none">
                  {{ summary.title }}
                </p>
                <p class="text-sm text-muted-foreground">
                  {{ summary.createdAt }}
                </p>
              </div>
              <div class="ml-auto">
                <Badge :variant="getStatusVariant(summary.status)">
                  {{ summary.status }}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Content Type Breakdown -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Content Distribution</CardTitle>
          <CardDescription>Summaries by content type</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="stat in [
                { name: 'Articles', value: '67%', count: 8234 },
                { name: 'YouTube', value: '28%', count: 3456 },
                { name: 'Reddit', value: '5%', count: 655 }
              ]"
              :key="stat.name"
            >
              <div class="flex items-center justify-between text-sm">
                <span class="font-medium">{{ stat.name }}</span>
                <span class="text-muted-foreground">{{ stat.count }}</span>
              </div>
              <div class="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  class="h-full bg-primary"
                  :style="{ width: stat.value }"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Token Usage</CardTitle>
          <CardDescription>By LLM provider</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="stat in [
                { name: 'OpenRouter', value: '52%', tokens: '1.2M' },
                { name: 'OpenAI', value: '35%', tokens: '0.8M' },
                { name: 'Anthropic', value: '13%', tokens: '0.3M' }
              ]"
              :key="stat.name"
            >
              <div class="flex items-center justify-between text-sm">
                <span class="font-medium">{{ stat.name }}</span>
                <span class="text-muted-foreground">{{ stat.tokens }}</span>
              </div>
              <div class="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  class="h-full"
                  :class="{
                    'OpenRouter': 'bg-purple-500',
                    'OpenAI': 'bg-green-500',
                    'Anthropic': 'bg-orange-500'
                  }[stat.name]"
                  :style="{ width: stat.value }"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Overall system status</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">API Status</span>
              <Badge class="bg-green-500">Operational</Badge>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">Success Rate</span>
              <span class="text-sm text-muted-foreground">98.5%</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">Avg Response Time</span>
              <span class="text-sm text-muted-foreground">2.3s</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">Active Users</span>
              <span class="text-sm text-muted-foreground">47</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
