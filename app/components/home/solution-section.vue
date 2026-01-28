<template>
  <section class="py-24 bg-muted/30">
    <div class="max-w-4xl mx-auto">
      <h2
        class="text-3xl md:text-5xl font-bold text-foreground mb-16 text-center"
      >
        Clear your tabs.<br >
        Keep the insight.
      </h2>

      <div class="grid md:grid-cols-3 gap-8 mb-16">
        <div class="text-center p-8">
          <div
            class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center"
          >
            <Icon name="lucide:link" class="w-10 h-10 text-primary" />
          </div>
          <h3 class="text-xl font-semibold text-foreground mb-3">Paste</h3>
          <p class="text-muted-foreground">Article, video, whatever</p>
        </div>

        <div class="text-center p-8">
          <div
            class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center"
          >
            <Icon name="lucide:sparkles" class="w-10 h-10 text-primary" />
          </div>
          <h3 class="text-xl font-semibold text-foreground mb-3">
            AI extracts
          </h3>
          <p class="text-muted-foreground">The good stuff, not the fluff</p>
        </div>

        <div class="text-center p-8">
          <div
            class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center"
          >
            <Icon name="lucide:file-check" class="w-10 h-10 text-primary" />
          </div>
          <h3 class="text-xl font-semibold text-foreground mb-3">Get it</h3>
          <p class="text-muted-foreground">In about 60 seconds</p>
        </div>
      </div>

      <div
        class="max-w-2xl mx-auto text-center p-8 bg-card border border-border rounded-xl"
      >
        <p class="text-xl text-foreground leading-relaxed mb-6">
          Imagine finally closing those tabs. Actually feeling caught up.
          Knowing what's happening without spending your whole day reading.
        </p>
        <p class="text-lg text-primary font-semibold mb-6">
          That's what Fewwords does.
        </p>
        <!-- <Button size="lg" class="text-lg px-8 py-6" as-child>
          <NuxtLink to="/app">Try It Now →</NuxtLink>
        </Button> -->
      </div>
    </div>
  </section>
</template>
