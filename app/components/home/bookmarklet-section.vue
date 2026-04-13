<script setup lang="ts">
import landingCopy from "~/content/landing-copy";

const bookmarkletUrl = useState("bookmarklet-url", () => {
  const origin = useRequestURL().origin;
  return `javascript:(function(){window.location.href='${origin}/app?url='+encodeURIComponent(window.location.href)})()`;
});
</script>

<template>
  <section id="bookmarklet" class="py-24 px-4 bg-muted/30">
    <div class="max-w-3xl mx-auto text-center">
      <h2 class="text-3xl md:text-4xl font-bold text-foreground mb-4">
        {{ landingCopy.bookmarklet_section.headline }}
      </h2>
      <p class="text-xl text-muted-foreground mb-8">
        {{ landingCopy.bookmarklet_section.subheadline }}
      </p>

      <p class="text-lg text-muted-foreground mb-12 max-w-xl mx-auto">
        {{ landingCopy.bookmarklet_section.description }}
      </p>

      <div class="mb-8">
        <a
          :href="bookmarkletUrl"
          class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors cursor-grab active:cursor-grabbing select-none"
        >
          <Icon name="lucide:bookmark" class="w-5 h-5" />
          {{ landingCopy.bookmarklet_section.cta }}
        </a>
      </div>

      <p class="text-sm text-muted-foreground">
        {{ landingCopy.bookmarklet_section.note }}
      </p>
    </div>
  </section>
</template>
