<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import landingCopy from "~/content/landing-copy";
</script>

<template>
  <section id="faq" class="py-24 px-4 bg-muted/20 border-t border-border">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-3xl font-bold text-center mb-12 text-foreground">
        {{ landingCopy.faq_section.headline }}
      </h2>
      <div class="grid gap-6 md:grid-cols-2">
        <Card
          v-for="faq in landingCopy.faq_section.faqs"
          :key="faq.question"
          class="bg-card border-border hover:border-primary/50 transition-colors shadow-none"
        >
          <CardHeader>
            <CardTitle
              class="text-lg font-semibold text-foreground leading-tight"
            >
              {{ faq.question }}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-muted-foreground leading-relaxed">
              {{ faq.answer }}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>
