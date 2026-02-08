<script setup lang="ts">
const route = useRoute();

// Check for reader mode via query param (?r or ?reader)
const isReaderMode = computed(() => {
  return "r" in route.query || "reader" in route.query;
});
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <LayoutHeader v-if="!isReaderMode" />
    <main
      class="flex-1 mx-auto w-full"
      :class="isReaderMode ? 'max-w-3xl' : 'max-w-4xl'"
    >
      <slot />
    </main>
    <LayoutFooter v-if="!isReaderMode" />
  </div>
</template>
