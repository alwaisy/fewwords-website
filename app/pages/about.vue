<script setup lang="ts">
useHead({
  title: 'Finally Close Those Tabs - About Fewwords',
  titleTemplate: null
})
</script>

<template>
  <main class="flex-1">
    <section class="py-16 px-4">
      <div class="max-w-3xl mx-auto">
        <h1 class="text-4xl font-bold text-foreground mb-6">
          About Fewwords
        </h1>

        <div class="prose prose-muted max-w-none">
          <p class="text-lg text-muted-foreground mb-6">
            Fewwords is an AI-powered content summarization tool that helps you consume information
            more efficiently.
          </p>

          <h2 class="text-2xl font-semibold text-foreground mt-12 mb-4">
            How It Works
          </h2>
          <p class="text-muted-foreground mb-4">
            Paste any article or video URL, and the AI extracts the key points, main arguments,
            and practical takeaways. You get a concise summary in seconds, not hours.
          </p>

          <h2 class="text-2xl font-semibold text-foreground mt-12 mb-4">
            Why I Built This
          </h2>
          <p class="text-muted-foreground mb-4">
            I'm drowning in content. Articles, videos, newsletters—it's too much. I wanted
            a tool that respects your time and helps you focus on what matters.
          </p>

          <h2 class="text-2xl font-semibold text-foreground mt-12 mb-4">
            The Philosophy
          </h2>
          <p class="text-muted-foreground mb-4">
            I believe that good tools should be simple, fast, and honest. No fluff, just results.
          </p>

          <div class="mt-12 p-6 bg-muted/30 border border-border rounded-lg">
            <p class="text-muted-foreground mb-4">
              Questions or feedback? I'd love to hear from you.
            </p>
            <Button as-child>
              <NuxtLink to="/contact">Reach Out</NuxtLink>
            </Button>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
