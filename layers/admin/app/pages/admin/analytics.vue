<script setup lang="ts">
import { Loader2, TrendingUp, Users, FileText, Globe } from "lucide-vue-next";

import SimpleBarChart from "../../components/charts/simple-bar-chart.client.vue";
import SimpleDonutChart from "../../components/charts/simple-donut-chart.client.vue";
import SimpleLineChart from "../../components/charts/simple-line-chart.client.vue";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

useHead({
  title: "Analytics | Admin",
});

const { data, pending, error } = await useFetch("/api/admin/analytics");

// Format date for display on x-axis
const formatDate = (dateStr: string | number) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};
</script>

<template>
  <div class="flex-1 space-y-6 p-4 md:p-8 pt-0">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">Attribution Analytics</h1>
    </div>

    <div v-if="pending" class="flex flex-col items-center justify-center p-12 min-h-[400px]">
      <Loader2 class="h-10 w-10 animate-spin text-primary mb-4" />
      <p class="text-muted-foreground animate-pulse">Gathering insights...</p>
    </div>

    <div v-else-if="error" class="text-red-500 bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <h2 class="text-lg font-semibold mb-2">Error loading analytics</h2>
      <p>{{ error.message }}</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Top Row: Time Series -->
      <div class="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div class="flex items-center gap-2">
              <TrendingUp class="h-4 w-4 text-primary" />
              <CardTitle class="text-base">Summaries Trend</CardTitle>
            </div>
            <CardDescription>Daily summaries created over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="data?.summariesOverTime?.length">
              <SimpleLineChart
                :data="data.summariesOverTime"
                x-key="date"
                y-key="count"
                :height="250"
                :x-tick-format="formatDate"
              />
            </div>
            <div v-else class="h-[250px] flex items-center justify-center text-muted-foreground italic">
              No data for this period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div class="flex items-center gap-2">
              <Users class="h-4 w-4 text-primary" />
              <CardTitle class="text-base">Signups Trend</CardTitle>
            </div>
            <CardDescription>Daily user registrations over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="data?.usersOverTime?.length">
              <SimpleLineChart
                :data="data.usersOverTime"
                x-key="date"
                y-key="count"
                :height="250"
                color="hsl(var(--secondary))"
                :x-tick-format="formatDate"
              />
            </div>
            <div v-else class="h-[250px] flex items-center justify-center text-muted-foreground italic">
              No data for this period
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Second Row: Sources -->
      <div class="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div class="flex items-center gap-2">
              <FileText class="h-4 w-4 text-primary" />
              <CardTitle class="text-base">Top Summary Sources</CardTitle>
            </div>
            <CardDescription>Leading UTM sources for summaries</CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="data?.summariesBySource?.length">
              <SimpleBarChart
                :data="data.summariesBySource"
                x-key="source"
                y-key="count"
                :height="200"
              />
            </div>
            <div v-else class="h-[200px] flex items-center justify-center text-muted-foreground italic">
              No data yet
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div class="flex items-center gap-2">
              <Users class="h-4 w-4 text-primary" />
              <CardTitle class="text-base">Top Signup Sources</CardTitle>
            </div>
            <CardDescription>Leading UTM sources for new accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="data?.usersBySource?.length">
              <SimpleBarChart
                :data="data.usersBySource"
                x-key="source"
                y-key="count"
                :height="200"
                color="hsl(var(--secondary))"
              />
            </div>
            <div v-else class="h-[200px] flex items-center justify-center text-muted-foreground italic">
              No data yet
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Third Row: Geography & Devices -->
      <div class="grid gap-4 md:grid-cols-3">
        <Card class="md:col-span-2">
          <CardHeader>
            <div class="flex items-center gap-2">
              <Globe class="h-4 w-4 text-primary" />
              <CardTitle class="text-base">Geographic Distribution</CardTitle>
            </div>
            <CardDescription>Summaries by country code</CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="data?.summariesByCountry?.length" class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <SimpleDonutChart
                :data="data.summariesByCountry"
                label-key="country"
                value-key="count"
                :height="200"
              />
              <div class="space-y-2">
                <div v-for="item in data.summariesByCountry.slice(0, 5)" :key="item.country" class="flex justify-between items-center text-sm border-b pb-1">
                  <span class="font-medium uppercase">{{ item.country }}</span>
                  <span class="text-muted-foreground font-mono">{{ item.count }}</span>
                </div>
              </div>
            </div>
            <div v-else class="h-[200px] flex items-center justify-center text-muted-foreground italic">
              No data yet
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div class="flex items-center gap-2">
              <TrendingUp class="h-4 w-4 text-primary" />
              <CardTitle class="text-base">Devices</CardTitle>
            </div>
            <CardDescription>Unique Device IDs</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div v-for="item in data?.deviceDistribution?.slice(0, 5)" :key="item.device" class="flex flex-col gap-1">
                <div class="flex justify-between text-xs">
                  <span class="truncate max-w-[120px] font-mono text-[10px]" :title="item.device">{{ item.device }}</span>
                  <span>{{ item.count }}</span>
                </div>
                <div class="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div 
                    class="bg-primary h-full rounded-full" 
                    :style="{ width: (data?.deviceDistribution?.[0]?.count ? (item.count / data.deviceDistribution[0].count * 100) : 0) + '%' }"
                  />
                </div>
              </div>
              <div v-if="!data?.deviceDistribution?.length" class="text-center py-8 text-muted-foreground italic text-sm">
                No device data yet
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
