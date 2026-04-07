<script setup lang="ts">
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "~/components/ui/card";

const faqs = [
  {
    question: "Is it really free?",
    acceptedAnswer: "You start with 2,500 free words. That's the total length of summaries you can generate, not the articles you paste, just the output Fewwords actually produces. No credit card needed to start.",
  },
  {
    question: "How does the word count work?",
    acceptedAnswer: "I only count the summary I generate, not the article or video you paste. A typical article summary runs 80-150 words. So 2,500 free words gets you roughly 15-30 summaries to start.",
  },
  {
    question: "Does it work on YouTube?",
    acceptedAnswer: "Yes. Any YouTube video up to 3 hours. Shorts are skipped, they are too short to summarize meaningfully. Long videos run in the background.",
  },
  {
    question: "Why not just use ChatGPT?",
    acceptedAnswer: "You can. ChatGPT needs you to open it, copy the content, and write a prompt. Fewwords needs a URL. One step instead of five.",
  },
  {
    question: "What are the different summary formats?",
    acceptedAnswer: "The app classifies the content first. Research and essays get a structured summary. Specs and how-tos become a data shot. News becomes a decision brief. You don't pick, it picks.",
  },
  {
    question: "Can I share a summary with someone who doesn't have an account?",
    acceptedAnswer: "Yes. Every summary has a public link like fewwords.app/few-XYZ. Anyone can read it. You don't even need an account to create summaries, either.",
  },
];
</script>

<template>
  <section id="faq" class="py-24 px-4 bg-muted/20 border-t border-border">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-3xl font-bold text-center mb-12 text-foreground">
        Frequently Asked Questions
      </h2>
      <div class="grid gap-6 md:grid-cols-2">
        <Card
          v-for="faq in faqs"
          :key="faq.question"
          class="bg-card border-border hover:border-primary/50 transition-colors shadow-none"
        >
          <CardHeader>
            <CardTitle class="text-lg font-semibold text-foreground leading-tight">
              {{ faq.question }}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-muted-foreground leading-relaxed">
              {{ faq.acceptedAnswer }}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>
