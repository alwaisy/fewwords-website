<script setup lang="ts">
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

definePageMeta({
  layout: "admin",
  middleware: "admin",
});

const userData = useAuth().user;
</script>

<template>
  <div class="flex-1 space-y-4">
    <!-- Page Header -->
    <div class="flex items-center justify-between space-y-2">
      <h1 class="text-2xl font-bold tracking-tight">
        Hola, {{ userData?.name }}!
      </h1>
    </div>

    <!-- Stats Cards -->
    <stats-cards />

    <!-- Daily Summaries + Content Distribution - 2 Columns -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Daily Summaries</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent class="pl-2">
          <stats-daily-summaries />
        </CardContent>
      </Card>
      <stats-content-distribution />
    </div>

    <!-- Recent Summaries - Full Width -->
    <stats-recent-summaries />
  </div>
</template>
