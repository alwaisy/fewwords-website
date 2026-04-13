<script setup lang="ts">
const siteUrl = useSiteConfig().url;

useHead({
  link: [{ rel: "canonical", href: `${siteUrl}/about` }],
});

useSeoMeta({
  title: "The Story Behind Fewwords",
  titleTemplate: null,
  description:
    "Why I built Fewwords. A tool for people who save content they never read.",
  ogTitle: "The Story Behind Fewwords",
  ogDescription:
    "Why I built Fewwords. A tool for people who save content they never read.",
  twitterTitle: "The Story Behind Fewwords",
  twitterDescription:
    "Why I built Fewwords. A tool for people who save content they never read.",
});
</script>

<template>
  <main class="flex-1 py-16 px-4">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-4xl font-bold tracking-tight mb-4">
        Built because I needed it
      </h1>
      <p class="text-xl text-muted-foreground mb-12">
        Independent, small, opinionated.
      </p>

      <div
        class="prose prose-muted max-w-none text-lg leading-relaxed space-y-6"
      >
        <p>I have a confession: <strong>I can't read long articles.</strong></p>

        <p>
          And I definitely can't watch 2-hour long videos. My attention span is
          basically a sieve, and my browser is a graveyard of "tabs I'll read
          later." We both know I never read them.
        </p>

        <p>
          For about a year, my workflow was painful. Every time I found a video
          I wanted the "gist" of, I'd hunt for a free transcript tool, copy the
          entire wall of text, and paste it into ChatGPT or Claude with a messy
          prompt. It worked, but it felt like extra work to avoid work.
        </p>

        <p>
          Then the AI world exploded. Models started reading videos directly. In
          early 2025, I spent two weeks building the first version of this. I
          called it
          <em>Key-Insights</em>. It was a disaster. Google blocked my VPS from
          grabbing transcripts, and I hit a wall. I failed, so I quit.
        </p>

        <p>
          Fast forward to early 2026. I decided to try one more time. This time,
          with some help from the latest AI (thanks, Gemini), I rebuilt it from
          scratch. I called it <strong>Fewwords</strong>.
        </p>

        <div
          class="not-prose my-12 p-8 border border-border rounded-xl bg-muted/30"
        >
          <h2 class="text-xl font-semibold mb-4 text-foreground">
            It doesn't just summarize. It understands intent.
          </h2>
          <p class="text-muted-foreground mb-0">
            The engine runs through a multi-stage process: it extracts the raw
            data, classifies exactly what kind of content it's looking at, and
            then picks the most relevant strategy to give you a summary that
            actually makes sense.
          </p>
          <div class="mt-6 grid gap-4 sm:grid-cols-3">
            <div class="p-4 rounded-lg bg-background border border-border">
              <p class="font-semibold text-foreground text-sm">Structured</p>
              <p class="text-xs text-muted-foreground mt-1">
                Essays, research, analysis
              </p>
            </div>
            <div class="p-4 rounded-lg bg-background border border-border">
              <p class="font-semibold text-foreground text-sm">Data Shot</p>
              <p class="text-xs text-muted-foreground mt-1">
                Specs, tutorials, how-tos
              </p>
            </div>
            <div class="p-4 rounded-lg bg-background border border-border">
              <p class="font-semibold text-foreground text-sm">
                Decision Brief
              </p>
              <p class="text-xs text-muted-foreground mt-1">
                News, reviews, updates
              </p>
            </div>
          </div>
        </div>

        <p>
          To make this work, I built three distinct pipelines: one for
          <strong>articles</strong>, one for <strong>short videos</strong> (up
          to 20 minutes), and a heavy-duty one for
          <strong>long-form videos</strong> (up to 3 hours). Reddit support is
          coming next.
        </p>

        <p>
          Every summary gets a public link. Send it to anyone. They don't need
          an account to read it. You don't even need an account to create one.
        </p>

        <div
          class="not-prose mt-12 p-8 border border-border rounded-xl bg-muted/30"
        >
          <h2 class="text-xl font-semibold mb-4 text-foreground">
            A small note on "validation"
          </h2>
          <p class="text-muted-foreground italic mb-0">
            Truth is, I haven't validated if there's actually a demand for this
            yet. I built it because I needed it. If it helps you close even one
            tab today, then it was worth the two weeks of coding.
          </p>
        </div>

        <div class="mt-8 text-center text-muted-foreground">
          <p>
            Questions? Feedback?
            <NuxtLink
              to="/contact"
              class="text-primary hover:underline font-medium"
              >Reach out</NuxtLink
            >.
          </p>
        </div>

        <div class="flex items-center justify-center pt-8">
          <Button v-umami="'about-cta'" as-child size="lg">
            <NuxtLink to="/">Try it free</NuxtLink>
          </Button>
        </div>
      </div>
    </div>
  </main>
</template>
