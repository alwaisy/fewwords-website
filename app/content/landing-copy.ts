// app/content/landing-copy-v1.ts

const landingCopy = {
  hero_section: {
    headline: "The quick & painless way to read the internet",
    subheadline: "Paste a URL. Get the main points. Skip the rest.",
    cta: "Paste a URL",
    note: "Articles, YouTube, Reddit. No signup needed.",
  },

  problem_agitation: [
    "23 open tabs. 8 articles saved for later. A YouTube video from Tuesday you keep meaning to watch.",
    "You want to stay informed. But reading everything takes time you don't have.",
    "The content isn't getting shorter. Your day isn't getting longer.",
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
