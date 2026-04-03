// app/content/landing-copy-v1.ts

const landingCopy = {
  hero_section: {
    headline: "Instant insights from any article or video",
    subheadline: "Paste a URL. Get the main points. Skip the filler.",
    cta: "Summarize a URL",
    note: "Articles, YouTube, Reddit. Simple & actionable.",
  },

  problem_agitation: [
    "Most content is 90% filler. You want the insights, but you don't have the time to sit through a 20-minute video or 3,000-word essay.",
    "Generic AI tools require manual copy-pasting and complex prompts just to get a decent summary.",
    "You need a simpler way to stay informed without the noise.",
  ],

  metrics_strip: [
    { value: "140+", label: "Summaries written" },
    { value: "90+", label: "Articles read" },
    { value: "40+", label: "Videos watched" },
    { value: "3", label: "Content types" },
  ],

  features_section: [
    {
      title: "Articles",
      description:
        "Any public article. Research, news, opinion, how-to. It reads the piece, works out what kind it is, and formats the summary to match.",
    },
    {
      title: "YouTube videos",
      description:
        "Any video up to 3 hours. Long ones run in the background. Shorts are skipped — too short to summarize.",
    },
    {
      title: "Reddit threads",
      description:
        "Pulls the actual arguments out of any thread. Useful for buying decisions, research, or just figuring out what people think.",
    },
    {
      title: "Shareable by default",
      description:
        "Every summary gets a clean public link. Send it to anyone. They don't need an account to read it.",
    },
  ],

  workflow_section: {
    headline: "Your current workflow vs. this",
    subheadline: "",
    without: [
      "Copy the article text",
      "Open ChatGPT",
      "Paste the whole thing",
      "Write a prompt",
      "Read a wall of text",
    ],
    with: ["Paste the URL", "Read the summary", "Move on"],
    note: "No copying. No prompts. Just the URL.",
  },

  usp_section: {
    headline: "Why not just use ChatGPT?",
    subheadline: "You can. Here's the difference.",
    points: [
      {
        title: "No copy-paste",
        description: "You don't need to copy article text. Just grab the URL.",
      },
      {
        title: "No prompt writing",
        description:
          "No 'summarize this in bullet points please'. It reads the content itself.",
      },
      {
        title: "One clean result",
        description: "5-7 bullets. Not a 400-word essay with a friendly intro.",
      },
    ],
  },

  bookmarklet_section: {
    headline: "The bookmarklet",
    subheadline: "One click from any page.",
    steps: [
      "Drag this button to your bookmarks bar",
      "Click it while reading something worth summarizing",
      "Get redirected here with the URL already filled in",
    ],
    note: "Works on articles, YouTube, Reddit. Anything with a URL.",
  },

  final_cta: {
    headline: "Your content isn't going to read itself. But I will.",
    cta: "Paste a URL",
    note: "No signup. No credit card. Your first summary is free.",
  },
};

export default landingCopy;
