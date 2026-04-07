<script setup lang="ts">
interface Props {
  readerMode?: boolean;
  lastUpdated?: string | Date | null;
}

defineEmits<{
  'do-another': []
}>()

const props = defineProps<Props>()

const formattedDate = computed(() => {
  if (!props.lastUpdated) return null;
  return new Date(props.lastUpdated).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
});
</script>

<template>
  <div v-if="!readerMode" class="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
    <Button size="lg" class="w-full sm:w-auto" @click="$emit('do-another')">
      Do Another One
    </Button>
    <div v-if="formattedDate" class="text-sm text-muted-foreground italic">
      Summarised on {{ formattedDate }}
    </div>
  </div>
</template>
