// Fewwords About Page Copy - Refined Tone

const aboutCopy = {
  seo: {
    title: "The Story Behind Fewwords",
    description: "Why I built Fewwords. A tool for people who save content they never read.",
  },
  hero: {
    headline: "Built because I needed it",
    subheadline: "Independent, small, simple.",
  },
  content: {
    confession: "I have a confession: I can't focus through long articles.",
    intro: [
      "And I definitely can't sit through 2-hour long videos. My attention span is short, and my browser is a graveyard of open tabs I never actually read. We both know that 'later' never comes.",
      "For a year, my workflow was broken. Every time I wanted to extract the essence of a video, I had to hunt for a transcript tool, copy a wall of text, and paste it into ChatGPT with unreliable prompts. It worked, but it felt like too much friction just to save time.",
      "In early 2025, I built a first version called Key-Insights. At the time, AI models weren't capable of processing video natively, so I had to rely on brittle transcription scrapers that YouTube eventually blocked. I hit a technical dead end and quit.",
      "By early 2026, the technology had caught up. New models like the Gemini 3 series became capable of watching and understanding video content directly. I rebuilt everything from scratch to leverage this new architecture and called it Fewwords."
    ],
    intent_box: {
      title: "It doesn't just summarize. It understands intent.",
      description: "I built a multi-stage engine that extracts raw data, classifies the content, and picks the most relevant strategy to give you an actionable summary that actually makes sense.",
      strategies: [
        { name: "Structured", for: "Essays, research, analysis" },
        { name: "Data Shot", for: "Specs, tutorials, how-tos" },
        { name: "Decision Brief", for: "News, reviews, updates" }
      ]
    },
    pipelines: "To make this work, I built three distinct, high-fidelity pipelines: one for articles, one for short videos, and a dedicated one for long-form content up to 3 hours. Reddit support is coming next.",
    sharing: "Every summary has a public link. You can share it with anyone. No account needed to read or even create one.",
    validation_box: {
      title: "A note on validation",
      description: "I haven't actually validated if there is a massive demand for this yet. I built it because I needed it. If it helps you close even one tab today, then it was worth the effort."
    },
    footer: {
      text: "Questions? Feedback?",
      cta_text: "Reach out",
      cta_link: "/contact"
    },
    final_cta: "Try it free"
  }
};

export default aboutCopy;
