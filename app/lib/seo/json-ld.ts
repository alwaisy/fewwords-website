export const getJsonLd = (siteUrl: string) => [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: "Fewwords",
    alternateName: "Fewwords App",
    url: siteUrl,
    description:
      "Paste a URL. Get the main points. Skip the rest. Articles, YouTube, Reddit.",
    inLanguage: "en-US",
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "Fewwords",
    url: siteUrl,
    logo: `${siteUrl}/og-image.png`,
    description:
      "Instant content summarization for articles, YouTube videos, and Reddit threads.",
    foundingDate: "2026",
    sameAs: [
      "https://twitter.com/fewwords",
      "https://github.com/alwaisy/fewwords-website",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${siteUrl}/#app`,
    name: "Fewwords",
    url: siteUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
      description:
        "Paste a URL. Get the main points in under a minute. Articles, YouTube, Reddit. Start with 2,500 words free.",
    featureList: [
      "Article summarization",
      "YouTube video summarization",
      "Reddit thread summarization",
      "Shareable summary links",
      "No signup for first summary",
      "Bookmarklet support",
      "Personal summary library",
    ],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      description: "2,500 words free. No credit card.",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is it really free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You start with 2,500 free words. That's the total length of summaries you can generate, not the articles you paste, just the output Fewwords actually produces. No credit card needed to start.",
        },
      },
      {
        "@type": "Question",
        name: "How does the word count work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "I only count the summary I generate, not the article or video you paste. A typical article summary runs 80-150 words. So 2,500 free words gets you roughly 15-30 summaries to start.",
        },
      },
      {
        "@type": "Question",
        name: "Does it work on YouTube?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Any YouTube video up to 3 hours. Shorts are skipped, they are too short to summarize meaningfully. Long videos run in the background.",
        },
      },
      {
        "@type": "Question",
        name: "Why not just use ChatGPT?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can. ChatGPT needs you to open it, copy the content, and write a prompt. Fewwords needs a URL. One step instead of five.",
        },
      },
      {
        "@type": "Question",
        name: "What are the different summary formats?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The app classifies the content first. Research and essays get a structured summary. Specs and how-tos become a data shot. News becomes a decision brief. You don't pick, it picks.",
        },
      },
      {
        "@type": "Question",
        name: "Can I share a summary with someone who doesn't have an account?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Every summary has a public link like fewwords.app/few-XYZ. Anyone can read it. You don't even need an account to create summaries, either.",
        },
      },
    ],
  },
];
