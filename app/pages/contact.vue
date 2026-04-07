<script setup lang="ts">
const siteUrl = useSiteConfig().url;

useHead({
  link: [{ rel: "canonical", href: `${siteUrl}/contact` }],
});

useSeoMeta({
  title: "Contact - Fewwords",
  description: "Get in touch with the creator of Fewwords.",
  ogTitle: "Contact - Fewwords",
  ogDescription: "Get in touch with the creator of Fewwords.",
  twitterTitle: "Contact - Fewwords",
  twitterDescription: "Get in touch with the creator of Fewwords.",
});
</script>

<template>
  <main class="flex-1 py-16 px-4">
    <div class="max-w-2xl mx-auto text-center">
      <h1 class="text-4xl font-bold mb-6 tracking-tight">Reach Out</h1>
      
      <div class="prose prose-muted mx-auto text-lg leading-relaxed text-muted-foreground">
        <p>
          Fewwords is a solo project. I'm building this in public and I'd love to hear your thoughts, 
          bugs you've found, or features you're wishing for.
        </p>
        
        <div class="mt-12 space-y-8 not-prose">
          <div class="flex flex-col items-center">
            <span class="text-sm font-medium text-foreground uppercase tracking-widest mb-2">Email</span>
            <a 
              href="mailto:hello@fewwords.app" 
              class="text-2xl font-semibold text-primary hover:underline transition-colors"
            >
              hello@fewwords.app
            </a>
          </div>

          <div class="flex flex-col items-center">
            <span class="text-sm font-medium text-foreground uppercase tracking-widest mb-2">Twitter / X</span>
            <a 
              href="https://x.com/your_handle" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-2xl font-semibold text-primary hover:underline transition-colors"
            >
              @your_handle
            </a>
          </div>
        </div>

        <p class="mt-16 text-sm italic">
          I usually reply within 24-48 hours. Unless I'm deep in a coding session.
        </p>
      </div>

      <div class="mt-12">
        <Button as-child variant="outline">
          <NuxtLink to="/">Back to Home</NuxtLink>
        </Button>
      </div>
    </div>
  </main>
</template>
