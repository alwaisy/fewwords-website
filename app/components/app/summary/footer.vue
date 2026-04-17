<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  readerMode?: boolean;
  lastUpdated?: string | Date | null;
  content?: string;
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

const isCopied = ref(false)

async function copySummary() {
  if (!props.content) return

  try {
    await navigator.clipboard.writeText(props.content)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy text: ', err)
  }
}
</script>

<template>
  <div v-if="!readerMode" class="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
    <div class="flex items-center gap-3 w-full sm:w-auto">
      <Button size="lg" class="flex-1 sm:flex-none" @click="$emit('do-another')">
        Do Another One
      </Button>
      
      <Button 
        v-if="content"
        variant="outline" 
        size="lg" 
        class="flex-1 sm:flex-none" 
        :title="isCopied ? 'Copied' : 'Copy Summary'"
        @click="copySummary"
      >
        <Icon :name="isCopied ? 'lucide:check' : 'lucide:copy'" class="size-5" />
      </Button>
    </div>

    <div v-if="formattedDate" class="text-sm text-muted-foreground italic">
      Summarised on {{ formattedDate }}
    </div>
  </div>
</template>
