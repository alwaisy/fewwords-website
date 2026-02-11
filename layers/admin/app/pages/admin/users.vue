<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: ["admin"],
})
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <h1 class="text-3xl font-bold mb-4">Users</h1>
    <p class="text-muted-foreground mb-6">
      Third page from the admin layer.
    </p>

    <div class="border rounded-lg p-8 text-center text-muted-foreground">
      <p>User list would go here...</p>
    </div>
  </div>
</template>
