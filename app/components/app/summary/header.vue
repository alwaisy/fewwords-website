<script setup lang="ts">
import { parseInlineMarkdown } from '~/lib/markdown';

interface Props {
  title?: string;
  sourceUrl?: string;
  readerMode?: boolean;
  isSaved?: boolean;
}

defineEmits<{
  share: [];
  save: [];
  unsave: [];
  openSource: [];
}>();

const props = defineProps<Props>();

const renderedTitle = computed(() => {
  if (!props.title) return "";
  
  // Clean up any leaked markdown markers from existing DB records
  // Strip leading/trailing ** and clean up spaces
  let cleanTitle = props.title.trim();
  
  // If title starts and ends with **, strip them
  if (cleanTitle.startsWith('**') && cleanTitle.endsWith('**')) {
    cleanTitle = cleanTitle.slice(2, -2).trim();
  } else if (cleanTitle.startsWith('**')) {
    // If it only starts with **, check if it's a leaked label part like "** Self-Hosting"
    cleanTitle = cleanTitle.replace(/^\*\*+/, '').trim();
  }
  
  return parseInlineMarkdown(cleanTitle);
});
</script>

<template>
  <div class="space-y-6">
    <!-- Title -->
    <h1 
      class="text-3xl md:text-4xl font-bold text-foreground leading-tight tracking-tight summary-title"
      v-html="renderedTitle"
    />

    <!-- Actions -->
    <div
      class="flex items-center gap-3 border-y border-border my-12 py-3 justify-between"
    >
      <Button
        v-if="!readerMode"
        variant="ghost"
        class="h-8 px-3 rounded-full text-xs"
        @click="$emit('openSource')"
      >
        <Icon name="lucide:external-link" class="w-3 h-3 mr-1.5" />
        Source
      </Button>
      <Button
        v-if="!readerMode"
        variant="ghost"
        class="h-8 px-3 rounded-full text-xs"
        @click="$emit('share')"
      >
        <Icon name="lucide:share-2" class="w-3 h-3 mr-1.5" />
        Share
      </Button>

      <Button
        v-if="!isSaved"
        variant="ghost"
        class="h-8 px-3 rounded-full text-xs"
        @click="$emit('save')"
      >
        <Icon name="lucide:bookmark" class="w-3 h-3 mr-1.5" />
        Save
      </Button>
      <Button
        v-else
        variant="secondary"
        class="h-8 px-3 rounded-full text-xs"
        @click="$emit('unsave')"
      >
        <Icon name="lucide:bookmark-check" class="w-3 h-3 mr-1.5" />
        Saved
      </Button>
    </div>
  </div>
</template>

<style scoped>
.summary-title :deep(em) {
  font-style: italic;
}
.summary-title :deep(strong) {
  font-weight: 700;
}
.summary-title :deep(code) {
  font-family: var(--font-mono);
  background-color: hsl(var(--muted));
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.9em;
}
</style>
