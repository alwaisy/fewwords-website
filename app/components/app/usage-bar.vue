<script setup lang="ts">
const { isLoggedIn } = useAuth()
const { quota, percentUsed, usageText } = useQuota()
</script>

<template>
  <div v-if="isLoggedIn && quota.wordsLimit > 0" class="flex items-center gap-2 text-xs text-muted-foreground">
    <div class="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
      <div
        class="h-full bg-primary/60 rounded-full transition-all duration-300"
        :style="{ width: `${percentUsed}%` }"
      />
    </div>
    <span>{{ usageText }}</span>
  </div>
</template>
