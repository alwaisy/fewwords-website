// Fewwords Privacy Policy Content

const privacyCopy = {
  seo: {
    title: "Privacy Policy - Fewwords",
    description: "Privacy Policy for Fewwords. What I collect, why, and how I protect it.",
  },
  lastUpdated: "April 1, 2026",
  content: `# Privacy Policy

**Last updated: April 1, 2026**

I respect your privacy. This policy explains what data Fewwords collects, how I use it, and what choices you have.

---

## What I Collect

**When you create an account:**

- Your email address
- Your name
- A hashed version of your password (I never see the actual password)

**When you use the service:**

- URLs you submit for summarization
- The summaries I generate
- Metadata about the content (title, domain, word count, content type)
- Your IP address and basic browser info (collected automatically)

**Analytics:**

I use Umami, a privacy-friendly analytics tool. It tracks page views and basic usage patterns. No cookies for tracking. No personal data sold to anyone.

---

## How I Use Your Data

- **To run the service.** I need your email to log you in. I need URLs to generate summaries.
- **To improve Fewwords.** I look at usage patterns (not individual summaries) to make the product better.
- **To keep things secure.** I monitor for abuse, spam, and security threats.
- **To contact you.** I'll send login links and important service updates. No marketing emails unless you opt in.

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

These providers have their own privacy policies. I pick services that take data protection seriously.

**Future billing:** When I add paid plans through Polar, Polar will process your payment information. Polar acts as the merchant of record and handles billing data independently. I won't store your credit card details.

---

## Data Retention

- **Account data:** Kept as long as your account exists. Delete your account and I remove it.
- **Summaries:** Stored so you can access your library. You can delete individual summaries anytime.
- **Logs and analytics:** Retained for up to 90 days for security and debugging, then deleted.

---

## Your Rights

You can:

- **Access your data.** Ask me what I have and I'll tell you.
- **Correct your data.** Update your name, email, or other details in your settings.
- **Delete your data.** Delete individual summaries or your entire account.
- **Export your data.** Request a copy of your information.

To exercise any of these rights, email [hello@fewwords.app](mailto:hello@fewwords.app). I'll respond within 30 days.

---

## Cookies

Fewwords uses minimal cookies:

- **Session cookie:** Keeps you logged in. Essential for the service to work.
- **No tracking cookies.** I don't use cookies for advertising or cross-site tracking.

---

## Children's Privacy

Fewwords is not intended for children under 13. I don't knowingly collect data from children. If I learn that I have, I'll delete it immediately.

---

## Data Security

I use industry-standard measures to protect your data: encrypted connections (HTTPS), hashed passwords, and secure database access. No system is 100% secure, but I take it seriously.

---

## Changes to This Policy

If I make significant changes, I'll notify you via email or a notice on the site. The "Last updated" date at the top always reflects the current version.

---

## Contact

Questions or concerns about privacy? Reach out at [hello@fewwords.app](mailto:hello@fewwords.app).
`
};

export default privacyCopy;
