<script setup lang="ts">
const { isLoggedIn } = useAuth()
const { quota, percentUsed, usageText } = useQuota()
</script>

<template>
  <div v-if="isLoggedIn && quota.creditsLimit > 0" class="flex items-center gap-3 text-xs text-muted-foreground">
    <div class="flex items-center gap-1.5">
      <div class="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          class="h-full bg-primary/60 rounded-full transition-all duration-300"
          :style="{ width: `${percentUsed}%` }"
        />
      </div>
      <span class="font-medium text-foreground/80">{{ usageText }}</span>
    </div>
    
    <NuxtLink 
      v-if="percentUsed > 80" 
      to="/pricing" 
      class="text-primary hover:underline font-semibold"
    >
      Upgrade
    </NuxtLink>
  </div>
</template>
