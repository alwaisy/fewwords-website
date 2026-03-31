<script setup lang="ts">
useHead({
  title: 'The Story Behind Fewwords',
  titleTemplate: null,
  meta: [
    { name: 'description', content: 'Why I built Fewwords. A personal problem, a failed attempt, and a second chance.' }
  ]
})
</script>

<template>
  <main class="flex-1 py-16 px-4">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-4xl font-bold tracking-tight mb-8">The story</h1>

      <div class="prose prose-muted max-w-none text-lg leading-relaxed space-y-6">
        <p>
          I have a confession: <strong>I can't read long articles.</strong>
        </p>

        <p>
          And I definitely can't watch 2-hour long videos. My attention span is basically a 
          sieve, and my browser is a graveyard of "tabs I'll read later." 
          We both know I never read them.
        </p>

        <p>
          For about a year, my workflow was painful. Every time I found a video I wanted 
          the "gist" of, I'd hunt for a free transcript tool, copy the entire wall of text, 
          and paste it into ChatGPT or Claude with a messy prompt. It worked, but it felt like 
          extra work to avoid work.
        </p>

        <p>
          Then the AI world exploded. Models started reading videos directly. 
          In early 2025, I spent two weeks building the first version of this. I called it 
          <em>Key-Insights</em>. It was a disaster. Google blocked my VPS from grabbing 
          transcripts, and I hit a wall. I failed, so I quit.
        </p>

        <p>
          Fast forward to early 2026. I decided to try one more time. 
          This time, with some help from the latest AI (thanks, Gemini), I rebuilt it from 
          scratch. I called it <strong>Fewwords</strong>.
        </p>

        <p>
          It's not just a "make text shorter" tool. It's smart. 
          It doesn't just summarize; it <em>understands intent</em>. 
          The engine runs through a multi-stage process: it extracts the raw data, 
          classifies exactly what kind of content it's looking at, and then picks the 
          most relevant strategy to give you a summary that actually makes sense.
        </p>

        <p>
          To make this work, I built three distinct pipelines: 
          one for <strong>articles</strong>, 
          one for <strong>short videos</strong> (up to 20 minutes), 
          and a heavy-duty one for <strong>long-form videos</strong> (up to 3 hours). 
          Reddit support is coming next.
        </p>

        <div class="mt-12 p-8 border border-border rounded-xl bg-muted/30">
          <h2 class="text-xl font-semibold mb-4 text-foreground">A small note on "validation"</h2>
          <p class="text-muted-foreground italic mb-0">
            Truth is, I haven't validated if there's actually a demand for this yet. 
            I built it because I needed it. If it helps you close even one tab today, 
            then it was worth the two weeks of coding.
          </p>
        </div>

        <div class="mt-8 text-center text-muted-foreground">
          <p>Questions? Feedback? <NuxtLink to="/contact" class="text-primary hover:underline font-medium">Reach out</NuxtLink>.</p>
        </div>

        <div class="flex items-center justify-center pt-8">
          <Button as-child size="lg" v-umami="'about-cta'">
            <NuxtLink to="/">Summarize something →</NuxtLink>
          </Button>
        </div>
      </div>
    </div>
  </main>
</template>
