<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
interface Props {
  /** Size of the icon in pixels */
  size?: number | string;
  /** Whether to hide the "Fewwords" text label */
  hideText?: boolean;
  /** Target URL for the link */
  to?: string;
  /** Custom text to display */
  text?: string;
}

withDefaults(defineProps<Props>(), {
  size: 32,
  hideText: false,
  to: "/",
  text: "Fewwords",
});
</script>

<template>
  <NuxtLink
    :to="to"
    class="inline-flex items-center gap-2.5 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
  >
    <!-- Icon Mark -->
    <div
      class="shrink-0 overflow-hidden rounded-[20%] shadow"
      :style="{ width: `${size}px`, height: `${size}px` }"
    >
      <img
        src="/favicon-2048x2048.png"
        :width="size"
        :height="size"
        class="w-full h-full object-cover"
        alt="Fewwords"
      />
    </div>
    <!-- Brand Text -->
    <span
      v-if="!hideText"
      class="text-xl font-bold tracking-tight text-foreground select-none"
    >
      {{ text }}
    </span>
  </NuxtLink>
</template>
