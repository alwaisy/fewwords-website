<template>
  <section class="py-24 px-4">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-2xl md:text-3xl font-bold text-foreground mb-12 text-center">
        No BS. Just works.
      </h2>

      <div class="grid md:grid-cols-2 gap-6">
        <div class="group bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-colors">
          <Icon name="lucide:file-video" class="w-10 h-10 text-primary mb-4" />
          <h3 class="text-xl font-semibold text-foreground mb-2">Articles + videos</h3>
          <p class="text-muted-foreground">YouTube, blogs, tweets - if it has a URL</p>
        </div>

        <div class="group bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-colors">
          <Icon name="lucide:sparkles" class="w-10 h-10 text-primary mb-4" />
          <h3 class="text-xl font-semibold text-foreground mb-2">Actually readable</h3>
          <p class="text-muted-foreground">No AI-speak. No weird formatting. Just bullet points.</p>
        </div>

        <div class="group bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-colors">
          <Icon name="lucide:zap" class="w-10 h-10 text-primary mb-4" />
          <h3 class="text-xl font-semibold text-foreground mb-2">~60 seconds</h3>
          <p class="text-muted-foreground">Not instant. But faster than reading.</p>
        </div>

        <div class="group bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-colors">
          <Icon name="lucide:share-2" class="w-10 h-10 text-primary mb-4" />
          <h3 class="text-xl font-semibold text-foreground mb-2">Shareable</h3>
          <p class="text-muted-foreground">Clean links. Send to friends. No account needed.</p>
        </div>
      </div>
    </div>
  </section>
</template>
