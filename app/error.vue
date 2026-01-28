<script setup lang="ts">
const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-background">
    <div class="text-center">
      <div class="text-8xl mb-8">😵</div>

      <h1 class="text-6xl font-bold text-foreground mb-4">
        {{ error?.statusCode || 404 }}
      </h1>

      <p class="text-muted-foreground text-lg mb-8 max-w-md">
        {{ error?.statusCode === 404
          ? 'This page is playing hide and seek. And winning.'
          : 'Something broke. We\'re on it (probably).' }}
      </p>

      <Button size="lg" @click="handleError">
        Go Home
      </Button>
    </div>
  </div>
</template>
