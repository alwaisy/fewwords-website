<template>
  <section class="py-24 px-4 border-t border-border">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-5xl font-bold text-foreground mb-6">
          "Why not just use ChatGPT?"
        </h2>
        <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
          You could. You could also cook every meal from scratch.
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        <div class="p-6 rounded-xl bg-card border border-border">
          <div class="mb-4">
             <Icon name="lucide:terminal" class="w-8 h-8 text-primary" />
          </div>
          <h3 class="text-xl font-bold mb-2">No Prompt Engineering</h3>
          <p class="text-muted-foreground">
            Stop pasting "summarize this in a specific way..." prompts. We did the engineering for you. One click.
          </p>
        </div>

        <div class="p-6 rounded-xl bg-card border border-border">
          <div class="mb-4">
            <Icon name="lucide:brain-circuit" class="w-8 h-8 text-primary" />
          </div>
          <h3 class="text-xl font-bold mb-2">Tuned for Retention</h3>
          <p class="text-muted-foreground">
            Generic summaries are forgettable. Our SLAY model is designed to help you actually learn and remember.
          </p>
        </div>

        <div class="p-6 rounded-xl bg-card border border-border">
          <div class="mb-4">
            <Icon name="lucide:share-2" class="w-8 h-8 text-primary" />
          </div>
          <h3 class="text-xl font-bold mb-2">Shareable URLs</h3>
          <p class="text-muted-foreground">
            Try sharing a ChatGPT conversation. It's messy. FewWords gives you a clean, indexed page to save or send.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
