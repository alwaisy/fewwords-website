<script setup lang="ts">
import { sanitizeMarkdown } from "~/lib/markdown";

useHead({
  title: "Refund Policy - Fewwords",
  meta: [
    {
      name: "description",
      content: "Refund Policy for Fewwords.",
    },
  ],
});

const rawMarkdown = `# Refund Policy

**Last updated: April 1, 2026**

---

## Current Status

Fewwords is free to use right now. There's nothing to refund because we're not charging you anything. Enjoy it.

---

## When Paid Plans Launch

When we introduce paid plans, this policy will apply:

### Subscriptions

- You can cancel your subscription at any time from your account settings.
- After cancellation, you'll keep access until the end of your current billing period.
- We don't offer partial refunds for unused time in a billing cycle.

### Refund Eligibility

We'll issue a refund if:

- You were charged by mistake (duplicate payment, wrong plan, etc.).
- The service was unavailable for an extended period and you couldn't use it at all.
- You request a refund within **14 days** of your first purchase.

We won't issue a refund if:

- You used the service heavily during the billing period and simply changed your mind.
- You violated the Terms of Service and your account was suspended.

### How to Request a Refund

Email [hello@fewwords.app](mailto:hello@fewwords.app) with:

- Your account email
- The charge you're asking about
- A brief reason

We'll review it and respond within 5 business days.

### Payment Processing

Payments are processed by Paddle, our merchant of record. Paddle handles billing, taxes, and payment disputes. If you request a chargeback through your bank, Paddle's dispute process applies.

---

## Changes to This Policy

We'll update this page when paid plans become available. If we change the refund terms, the "Last updated" date at the top will reflect the revision.

---

## Contact

Questions? Email [hello@fewwords.app](mailto:hello@fewwords.app).
`;

const content = sanitizeMarkdown(rawMarkdown);
</script>

<template>
  <main class="flex-1 py-16 px-4">
    <div class="max-w-3xl mx-auto prose prose-muted dark:prose-invert" v-html="content" />
  </main>
</template>
