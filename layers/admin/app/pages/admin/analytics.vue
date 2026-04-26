<script setup lang="ts">
import { Loader2 } from "lucide-vue-next";

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
</script>

<template>
  <div class="flex-1 space-y-4 p-4 md:p-8 pt-0">
    <div class="flex items-center justify-between space-y-2">
      <h1 class="text-2xl font-bold tracking-tight">Attribution Analytics</h1>
    </div>

    <div v-if="pending" class="flex justify-center p-8">
      <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
    </div>

    <div v-else-if="error" class="text-red-500">
      Error loading analytics data: {{ error.message }}
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2">
      <!-- Summaries by UTM Source -->
      <Card>
        <CardHeader>
          <CardTitle>Summaries by Source</CardTitle>
          <CardDescription>UTM Sources for created summaries</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="item in data?.summariesBySource"
              :key="item.source"
              class="flex items-center justify-between"
            >
              <div class="font-medium truncate max-w-[200px]" :title="item.source">
                {{ item.source }}
              </div>
              <div class="text-muted-foreground">{{ item.count }}</div>
            </div>
            <div v-if="!data?.summariesBySource?.length" class="text-muted-foreground text-sm">
              No data yet.
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Users by UTM Source -->
      <Card>
        <CardHeader>
          <CardTitle>User Signups by Source</CardTitle>
          <CardDescription>UTM Sources for new user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="item in data?.usersBySource"
              :key="item.source"
              class="flex items-center justify-between"
            >
              <div class="font-medium truncate max-w-[200px]" :title="item.source">
                {{ item.source }}
              </div>
              <div class="text-muted-foreground">{{ item.count }}</div>
            </div>
            <div v-if="!data?.usersBySource?.length" class="text-muted-foreground text-sm">
              No data yet.
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Summaries by Country -->
      <Card>
        <CardHeader>
          <CardTitle>Summaries by Country</CardTitle>
          <CardDescription>Where summaries are being created from</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="item in data?.summariesByCountry"
              :key="item.country"
              class="flex items-center justify-between"
            >
              <div class="font-medium">{{ item.country }}</div>
              <div class="text-muted-foreground">{{ item.count }}</div>
            </div>
            <div v-if="!data?.summariesByCountry?.length" class="text-muted-foreground text-sm">
              No data yet.
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Users by Country -->
      <Card>
        <CardHeader>
          <CardTitle>User Signups by Country</CardTitle>
          <CardDescription>Where your users are located</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="item in data?.usersByCountry"
              :key="item.country"
              class="flex items-center justify-between"
            >
              <div class="font-medium">{{ item.country }}</div>
              <div class="text-muted-foreground">{{ item.count }}</div>
            </div>
            <div v-if="!data?.usersByCountry?.length" class="text-muted-foreground text-sm">
              No data yet.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
