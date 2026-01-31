<script setup lang="ts">
interface Props {
  readerMode?: boolean
}

defineEmits<{
  'do-another': []
}>()

defineProps<Props>()
</script>

<template>
  <div v-if="!readerMode" class="border-t border-border pt-8">
    <Button size="lg" class="w-full sm:w-auto" @click="$emit('do-another')">
      Do Another One
    </Button>
  </div>
</template>
