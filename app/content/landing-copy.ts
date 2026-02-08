const landingCopy = {
  hero_section: {
    headline: "You have {tabCount} unread tabs. I know, I had 20 too.",
    subheadline: "Paste a URL, get the gist in 60 seconds.",
    cta: "Paste URL →",
    note: "Built by one person. Used daily.",
  },
  features_section: [
    {
      title: "Articles + videos",
      description: "YouTube, blogs, Reddit - if it has a URL",
    },
    {
      title: "Actually readable",
      description: "No AI-speak. No weird formatting. Just bullet points.",
    },
    {
      title: "~60 seconds",
      description: "Not instant. But faster than reading.",
    },
    {
      title: "Shareable",
      description: "Clean links. Send to friends. No account needed.",
    },
  ],
  workflow_section: {
    headline: "The workflow",
    subheadline: "Here's what you do every day. Without switching apps.",
    without: [
      "Copy entire article text",
      "Open ChatGPT or Claude",
      "Paste all the content",
      "Write a prompt",
      "Wait for the summary",
    ],
    with: ["Copy the URL", "Paste here", "Done"],
    note: "You don't copy text anymore. You don't write prompts. That's the whole thing.",
  },
  final_cta: {
    headline: "Your tabs aren't going\nto read themselves.",
    cta: "Summarise 'em →",
    note: "No signup. No credit card.",
  },
  problem_agitation: [
    "You find an interesting article. You open it in a new tab. You promise yourself you'll read it 'later.'",
    "Three days later, that tab is still there. Along with 15 others. Your browser is basically a graveyard of good intentions.",
    "I built this because I was tired of copying text into ChatGPT. I just wanted to know what the article said.",
    "The problem isn't you. The problem is content is too long for the time you actually have.",
  ],
  metrics_strip: [
    { value: "140+", label: "Summaries written" },
    { value: "90+", label: "Articles read" },
    { value: "40+", label: "Videos watched" },
    { value: "3", label: "Content types" },
    // { value: "+", label: "More coming" },
  ],
  usp_section: {
    headline: '"Why not just use ChatGPT?"',
    subheadline: "You can. Here's what you do instead:",
    points: [
      {
        title: "No copying",
        description: "You don't copy text anymore. Just grab the URL.",
      },
      {
        title: "No prompts",
        description: "You don't write 'summarize this' anymore. It just works.",
      },
      {
        title: "Shareable",
        description:
          "Send the summary link to friends. They don't need an account.",
      },
    ],
  },
  bookmarklet_section: {
    headline: "The bookmarklet",
    subheadline: "One click from any page.",
    steps: [
      "Drag this button to your bookmarks bar",
      "When you're reading something worth summarizing, click it",
      "Get redirected here with the URL already pasted",
    ],
    note: "Works on articles, videos, Reddit posts. Anything with a URL.",
  },
};

export default landingCopy;
