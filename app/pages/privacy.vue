<script setup lang="ts">
import { sanitizeMarkdown } from "~/lib/markdown";

useHead({
  title: "Privacy Policy - Fewwords",
  meta: [
    {
      name: "description",
      content: "Privacy Policy for Fewwords. What we collect, why, and how we protect it.",
    },
  ],
});

const rawMarkdown = `# Privacy Policy

**Last updated: April 1, 2026**

We respect your privacy. This policy explains what data Fewwords collects, how we use it, and what choices you have.

---

## What We Collect

**When you create an account:**

- Your email address
- Your name
- A hashed version of your password (we never see the actual password)

**When you use the service:**

- URLs you submit for summarization
- The summaries we generate
- Metadata about the content (title, domain, word count, content type)
- Your IP address and basic browser info (collected automatically)

**Analytics:**

We use Umami, a privacy-friendly analytics tool. It tracks page views and basic usage patterns. No cookies for tracking. No personal data sold to anyone.

---

## How We Use Your Data

- **To run the service.** We need your email to log you in. We need URLs to generate summaries.
- **To improve Fewwords.** We look at usage patterns (not individual summaries) to make the product better.
- **To keep things secure.** We monitor for abuse, spam, and security threats.
- **To contact you.** We'll send login links and important service updates. No marketing emails unless you opt in.

---

## Third-Party Services

Fewwords relies on external providers to work. Here's who processes your data:

| Service | What they do | What they see |
|---------|-------------|---------------|
| **OpenRouter / OpenAI / Anthropic** | Generate summaries | The content you submit for summarization |
| **Jina AI** | Extract article text from URLs | The URLs you submit |
| **YouTube API** | Fetch video metadata | YouTube video URLs |
| **Resend** | Send login emails | Your email address |
| **Upstash Redis** | Power real-time progress updates | Temporary processing data |
| **Umami** | Privacy-focused analytics | Anonymous page view data |

These providers have their own privacy policies. We pick services that take data protection seriously.

**Future billing:** When we add paid plans through Paddle, Paddle will process your payment information. Paddle acts as the merchant of record and handles billing data independently. We won't store your credit card details.

---

## Data Retention

- **Account data:** Kept as long as your account exists. Delete your account and we remove it.
- **Summaries:** Stored so you can access your library. You can delete individual summaries anytime.
- **Logs and analytics:** Retained for up to 90 days for security and debugging, then deleted.

---

## Your Rights

You can:

- **Access your data.** Ask us what we have and we'll tell you.
- **Correct your data.** Update your name, email, or other details in your settings.
- **Delete your data.** Delete individual summaries or your entire account.
- **Export your data.** Request a copy of your information.

To exercise any of these rights, email [hello@fewwords.app](mailto:hello@fewwords.app). We'll respond within 30 days.

---

## Cookies

Fewwords uses minimal cookies:

- **Session cookie:** Keeps you logged in. Essential for the service to work.
- **No tracking cookies.** We don't use cookies for advertising or cross-site tracking.

---

## Children's Privacy

Fewwords is not intended for children under 13. We don't knowingly collect data from children. If we learn that we have, we'll delete it immediately.

---

## Data Security

We use industry-standard measures to protect your data: encrypted connections (HTTPS), hashed passwords, and secure database access. No system is 100% secure, but we take it seriously.

---

## Changes to This Policy

If we make significant changes, we'll notify you via email or a notice on the site. The "Last updated" date at the top always reflects the current version.

---

## Contact

Questions or concerns about privacy? Reach out at [hello@fewwords.app](mailto:hello@fewwords.app).
`;

const content = sanitizeMarkdown(rawMarkdown);
</script>

<template>
  <main class="flex-1 py-16 px-4">
    <div class="max-w-3xl mx-auto prose prose-muted dark:prose-invert" v-html="content" />
  </main>
</template>
