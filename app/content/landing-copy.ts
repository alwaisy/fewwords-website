// Fewwords Landing Page Copy v2
// Inspired by Seline Analytics - benefit-focused, empathetic, conversion-oriented

const landingCopy = {
  // 1. HERO SECTION
  hero_section: {
    // headline: "Summarize anything in 60 seconds. Actually useful summaries.",
    headline: "Summarize anything in 60 seconds.",
    subheadline:
      "Articles, YouTube, Reddit. Paste a URL, get the key points. No signup needed.",
    cta: "Try it free",
    cta_secondary: "See how it works",
    note: "8 summaries free. No credit card required.",
  },

  // 2. PROBLEM SECTION - Why current solutions fail
  problem_section: {
    headline: "Your browser has 47 tabs. You will read none of them.",
    supporting_copy:
      "I do it too. Save interesting articles, bookmark videos, tell myself I will get to them later. That later never comes.",
    steps: [
      {
        title: "Content is bloated.",
        body: "A 3,000-word article with 200 words of actual insight. A 45-minute video that could be 5 minutes. You want the signal, not the noise.",
      },
      {
        title: "Generic AI tools require work.",
        body: "Copy the text, open ChatGPT, paste it all, write a prompt, hope the output is decent. Five steps just to avoid reading.",
      },
      {
        title: "Summaries should match the content.",
        body: "A research paper needs structure. A news story needs the key facts. A tutorial needs the steps. One-size-fits-all summaries miss the point.",
      },
    ],
    closing: "You need a faster way to stay informed without the fluff.",
  },

  // 3. METRICS STRIP - Social proof
  metrics_strip: [
    { value: "60s", label: "Average time to summary" },
    { value: "3hr", label: "Max video length" },
    { value: "3", label: "Content types" },
    { value: "0", label: "Prompts to write" },
  ],

  // 4. DEMO SECTION
  demo_section: {
    headline: "See it in action",
    subheadline: "Two types of content. One simple flow.",
  },

  // 5. HOW IT WORKS - The workflow comparison
  workflow_section: {
    headline: "From URL to insight in 3 steps",
    subheadline: "No copy-pasting. No prompt engineering. Just results.",
    steps: [
      {
        number: "01",
        title: "Paste the URL",
        description:
          "Any article, YouTube video up to 3 hours, or Reddit thread.",
      },
      {
        number: "02",
        title: "It figures out the format",
        description:
          "Classifies the content type, then picks the right summary strategy.",
      },
      {
        number: "03",
        title: "You get actionable bullets",
        description: "5-7 key points you can actually use. Not a wall of text.",
      },
    ],
    comparison: {
      without: {
        label: "The old way",
        steps: [
          "Copy article text",
          "Open ChatGPT",
          "Paste everything",
          "Write a custom prompt",
          "Edit the output",
        ],
      },
      with: {
        label: "Fewwords",
        steps: ["Paste URL", "Get summary", "Move on"],
      },
    },
  },

  // 6. FEATURES SECTION - What you get
  features_section: {
    headline: "What you can summarize",
    subheadline: "Three content types. Each handled differently.",
    features: [
      {
        title: "Articles",
        tag: "Any length",
        description:
          "Research papers, news, essays, how-tos. The engine reads the full piece, classifies what type it is, and formats the summary to match. Research gets structure. News gets key facts. Tutorials get steps.",
      },
      {
        title: "YouTube videos",
        tag: "Up to 3 hours",
        description:
          "Long videos run in the background. You get the key insights without the watch time. Shorts are skipped. They are too short to meaningfully condense.",
      },
      {
        title: "Reddit threads",
        tag: "Discussions",
        description:
          "Pulls the actual arguments, recommendations, and consensus from any thread. Useful for product research, buying decisions, or understanding what people actually think.",
      },
      {
        title: "Shareable summaries",
        tag: "Public links",
        description:
          "Every summary gets a clean URL. Send it to anyone. They do not need an account to read it. Perfect for sharing insights with your team.",
      },
    ],
  },

  // 7. SMART FORMATTING - The secret sauce
  smart_formatting_section: {
    headline: "Summaries that match the content",
    subheadline: "Not all content should be summarized the same way.",
    formats: [
      {
        name: "Structured",
        for: "Essays, research, analysis",
        output: "Sections with headers, key arguments, and conclusions",
      },
      {
        name: "Data Shot",
        for: "Specs, tutorials, how-tos",
        output: "Bullet points with the essential facts and steps",
      },
      {
        name: "Decision Brief",
        for: "News, reviews, updates",
        output: "Key facts and what you need to know now",
      },
    ],
  },

  // 8. USP SECTION - Why Fewwords over alternatives
  usp_section: {
    headline: "Why not just use ChatGPT?",
    subheadline: "You can. Here is what is different.",
    points: [
      {
        title: "No copy-paste",
        description:
          "ChatGPT needs you to open it, copy content, and paste. Fewwords needs a URL. One step instead of five.",
      },
      {
        title: "No prompt writing",
        description:
          "No 'summarize this in bullet points please'. The system reads the content and picks the right format automatically.",
      },
      {
        title: "One clean result",
        description:
          "5-7 actionable bullets. Not a 400-word essay with a friendly intro you have to scroll past.",
      },
    ],
  },

  // 9. BOOKMARKLET SECTION
  bookmarklet_section: {
    headline: "The bookmarklet",
    subheadline: "Summarize from any page in one click.",
    description:
      "Drag a button to your bookmarks bar. Click it while reading something worth summarizing. Get taken here with the URL already filled.",
    note: "Works on articles, YouTube, Reddit. Anything with a URL.",
    cta: "Get the bookmarklet",
  },

  // 10. FOUNDER NOTE - Personal touch
  founder_note: {
    headline: "Built because I needed it",
    body: [
      "I have 200 unread tabs. I cannot focus through a 45-minute video. I was tired of copy-pasting into ChatGPT just to avoid the filler.",
      "Fewwords is the tool I wanted. Paste a URL, get what matters, move on with my day.",
      "It classifies content automatically, so a research paper gets structured sections while a news article gets key facts. You do not have to think about it.",
      "If it helps you close even one tab today, it was worth building.",
    ],
    cta: "Try it free",
    ps: "8 summaries free. No credit card needed.",
  },

  // 11. FINAL CTA
  final_cta: {
    headline: "Stop saving content for later. Summarize it now.",
    subheadline: "Your first 8 summaries are free. No signup required.",
    cta: "Summarize something",
    cta_secondary: "See pricing",
    note: "Takes 60 seconds. Works on articles, YouTube, and Reddit.",
  },

  // 12. FAQ DATA (used in faq-section.vue)
  faq_section: {
    headline: "Frequently Asked Questions",
    faqs: [
      {
        question: "Is it really free to start?",
        answer:
          "Yes. You get 8 summaries free. No credit card needed.",
      },
      {
        question: "How do credits work?",
        answer:
          "Every summary 'debits' your balance. An article is 1 credit. YouTube videos cost more because processing up to 3 hours of video involves significant AI resource usage. You get 8 credits for free to start.",
      },
      {
        question: "Does it work on YouTube?",
        answer:
          "Yes. Any video up to 3 hours. The system extracts the transcript and generates a summary. Shorts are skipped. They are too short to condense meaningfully.",
      },
      {
        question: "What makes this different from ChatGPT?",
        answer:
          "ChatGPT requires you to open it, copy content, paste it, and write a prompt. Fewwords just needs a URL. It also classifies content type automatically and formats the summary to match. Research gets structure. News gets facts. Tutorials get steps.",
      },
      {
        question: "What are the different summary formats?",
        answer:
          "The system classifies content first, then picks the right format. Research and essays get structured summaries with sections. Specs and tutorials become data shots with bullet points. News and updates become decision briefs with key facts. You do not pick. It picks.",
      },
      {
        question: "Can I share a summary with someone?",
        answer:
          "Yes. Every summary has a public link. Anyone can read it without signing up. Send it to your team, post it in Slack, bookmark it for later.",
      },
      {
        question: "Do I need an account?",
        answer:
          "No. You can create summaries without signing up. If you want to save summaries to a library or access them later, then you will need a free account.",
      },
      {
        question: "What content types work?",
        answer:
          "Articles (any public URL), YouTube videos (up to 3 hours), and Reddit threads. More coming soon.",
      },
    ],
  },
};

export default landingCopy;
