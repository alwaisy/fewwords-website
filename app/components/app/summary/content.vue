<script setup lang="ts">
interface Props {
  content?: string;
}
defineProps<Props>();
</script>

<template>
  <div class="summary-wrapper">
    <MDC
      v-if="content"
      :value="content"
      class="prose prose-lime prose-xl dark:prose-invert max-w-none p-2"
    />
    <div v-else class="flex items-center justify-center h-full">
      <Icon
        name="lucide:loader-2"
        class="w-10 h-10 text-primary animate-spin"
      />
    </div>
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
  border-left: 3px solid currentColor;
  padding-left: 1rem;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  font-style: normal;
}

.summary-wrapper :deep(blockquote p) {
  margin: 0;
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
