<script setup lang="ts">
import DOMPurify from "dompurify";
import { parse } from "marked";
import { computed, watch } from "vue";

import { convertYoutubeTimestamps } from "~/utils/markdown";

interface Props {
  content?: string;
  sourceUrl?: string;
}

const props = defineProps<Props>();

// Transform "Final Take:" and "Takeaway:" into blockquote for special styling
const transformedContent = computed(() => {
  if (!props.content) return "";

  let content = props.content;

  // Convert YouTube timestamps to clickable links if source URL is provided
  if (props.sourceUrl) {
    content = convertYoutubeTimestamps(content, props.sourceUrl);
  }

  // Strip the label and wrap content in blockquote
  const patterns: Array<[RegExp, string]> = [
    // ## Main Idea heading - remove entirely
    [/^##\s*Main Idea\s*[\n\r]+/gm, ""],
    // **Final Take:** content (bold format)
    [/^\*\*Final Take:\*\*\s*/gm, "> "],
    // Final Take: content (plain format)
    [/^Final Take:\s*/gm, "> "],
    // ## Takeaway content (header format)
    [/^##\s*Takeaway\s*[\n\r]+/gm, "> "],
    // **Takeaway:** content (bold format)
    [/^\*\*Takeaway:\*\*\s*/gm, "> "],
    // Takeaway: content (plain format)
    [/^Takeaway:\s*/gm, "> "],
    // best quote
    [/^##\s*BEST QUOTE\s*$/gm, ""],
  ];

  for (const [pattern, replacement] of patterns) {
    content = content.replace(pattern, replacement);
  }

  return content;
});

// Parse markdown to sanitized HTML (client-side only)
const renderedHtml = computed(() => {
  if (!transformedContent.value) return "";

  // Parse markdown to HTML
  const rawHtml = parse(transformedContent.value) as string;

  // Sanitize with DOMPurify (only on client)
  if (import.meta.client) {
    return DOMPurify.sanitize(rawHtml);
  }

  return rawHtml;
});

// Debug watch
watch(
  () => props.content,
  (newContent, oldContent) => {
    console.log("[AppSummaryContent] Content changed:", {
      oldLength: oldContent?.length ?? 0,
      newLength: newContent?.length ?? 0,
      hasNewContent: !!newContent,
      transformedLength: transformedContent.value.length,
    });
  },
  { immediate: true },
);
</script>

<template>
  <div class="summary-wrapper">
    <!-- Render sanitized HTML directly -->
    <ClientOnly>
      <div
        v-if="renderedHtml"
        class="prose prose-lime prose-xl dark:prose-invert max-w-none p-2"
        v-html="renderedHtml"
      />
      <template #fallback>
        <AppSummarySkeleton />
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.summary-wrapper :deep(h1),
.summary-wrapper :deep(h2),
.summary-wrapper :deep(h3),
.summary-wrapper :deep(h4) {
  margin-bottom: 0.2em;
  padding-bottom: 0;
  border-bottom: none;
  color: hsl(var(--foreground) / 0.6);
  text-transform: lowercase;
}

/* Headings - MANIPULATED SIZES */
.summary-wrapper :deep(h1) {
  font-weight: 700;
  font-size: 1.5em;
}

.summary-wrapper :deep(h1:first-child) {
  margin-top: 0;
}

.summary-wrapper :deep(h2) {
  font-weight: 600;
  font-size: 1.25em;
}

.summary-wrapper :deep(h3) {
  font-weight: 600;
  font-size: 1.1em;
}

.summary-wrapper :deep(h4) {
  font-weight: 600;
  font-size: 1em;
}

/* Bold */
.summary-wrapper :deep(strong) {
  font-weight: 600;
  color: hsl(var(--foreground));
}

/* Italic */
.summary-wrapper :deep(em) {
  font-style: italic;
}

/* Links */
.summary-wrapper :deep(a) {
  color: hsl(var(--foreground));
  text-decoration: underline;
  text-decoration-color: hsl(var(--foreground) / 0.3);
  text-underline-offset: 2px;
  transition: all 0.15s;
}

.summary-wrapper :deep(a:hover) {
  text-decoration-color: hsl(var(--foreground));
}

/* Inline code - Notion pink */
.summary-wrapper :deep(:not(pre) > code) {
  color: #eb5757;
  background-color: rgba(135, 131, 120, 0.15);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 85%;
  font-weight: 400;
}

.summary-wrapper :deep(:not(pre) > code::before),
.summary-wrapper :deep(:not(pre) > code::after) {
  content: "";
}

/* Code blocks */
.summary-wrapper :deep(pre) {
  background-color: hsl(var(--muted) / 0.4);
  border-radius: 3px;
  padding: 1rem;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  border: none;
}

.summary-wrapper :deep(pre code) {
  background-color: transparent;
  color: hsl(var(--foreground));
  padding: 0;
  font-weight: 400;
  font-size: 0.875em;
}

/* Blockquote */
.summary-wrapper :deep(blockquote) {
  color: var(--muted-foreground);
}

/* Special styling for Final Take blockquotes */
.summary-wrapper :deep(blockquote:has(strong)) {
  border-left: 4px solid hsl(var(--primary));
  background: hsl(var(--muted) / 0.3);
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1.5em;
  margin-bottom: 1em;
}

.summary-wrapper :deep(blockquote strong) {
  color: hsl(var(--primary));
  font-weight: 600;
}

/* Tables */
.summary-wrapper :deep(table) {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.summary-wrapper :deep(th) {
  padding: 0.5rem 0.75rem;
  font-weight: 600;
}

.summary-wrapper :deep(td) {
  padding: 0.5rem 0.75rem;
}

.summary-wrapper :deep(tbody tr:hover) {
  background-color: hsl(var(--muted) / 0.3);
}

/* HR */
.summary-wrapper :deep(hr) {
  margin-top: 1em;
  margin-bottom: 1em;
}

/* Images */
.summary-wrapper :deep(img) {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  border-radius: 3px;
}
</style>
