<template>
  <section class="py-24 md:py-40 px-4 border-b border-border">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-5xl md:text-7xl font-bold text-foreground mb-8 leading-[0.95] tracking-tight">
        You have 73 unread tabs.<br>
        <span class="text-primary">We both know it.</span>
      </h1>
      <p class="text-2xl text-muted-foreground mb-12 max-w-2xl leading-relaxed">
        Get the insight from any article or video. Skip the 2000 words. 60 seconds.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Button size="lg" class="text-lg px-8 py-6" as-child>
          <NuxtLink to="/app">Close My Tabs →</NuxtLink>
        </Button>
        <p class="text-sm text-muted-foreground">No signup. No credit card.</p>
      </div>
    </div>
  </section>
</template>
