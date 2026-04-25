// Fewwords Pricing Page Copy

const pricingCopy = {
  hero: {
    headline: "Simple Pricing",
    subheadline: "No complicated tiers or hidden fees. Buy the time you want to save.",
  },

  plans: [
    {
      name: "Skim",
      credits: 8,
      description: "Start for free. No credit card required.",
      features: [
        "8 Article or Reddit summaries",
        "No YouTube access",
        "History saved",
        "Standard support"
      ],
      cta: "Get Started",
      popular: false,
      priceIdKey: null, // Key in runtimeConfig.public.prices
      fallbackPrice: "0"
    },
    {
      name: "Read",
      credits: 30,
      description: "Built for casual readers and researchers.",
      features: [
        "30 Article summaries",
        "YouTube access (up to 3h)",
        "Ad-free experience",
        "History saved forever"
      ],
      cta: "Start 30 credits",
      popular: false,
      priceIdKey: "read",
      fallbackPrice: "4"
    },
    {
      name: "Digest",
      credits: 90,
      description: "For heavy content consumers and pros.",
      features: [
        "90 Article summaries",
        "Lower cost per YouTube video",
        "Priority AI processing",
        "History saved forever"
      ],
      cta: "Start 90 credits",
      popular: false,
      priceIdKey: "digest",
      fallbackPrice: "9"
    },
    {
      name: "Deep",
      credits: 225,
      description: "For power users treating Fewwords as a daily system.",
      features: [
        "225 Articles OR",
        "75 Short YouTube videos",
        "45 Medium YouTube videos",
        "17 Long YouTube videos",
        "Direct dev support"
      ],
      cta: "Go Deep",
      popular: false,
      priceIdKey: "deep",
      fallbackPrice: "18"
    }
  ],

  costs: [
    { type: "Article or Reddit", cost: "1 credit", note: "Any length" },
    { type: "Short YouTube (<20 min)", cost: "2-3 credits", note: "Lower on higher plans" },
    { type: "Medium YouTube (20-60 min)", cost: "5-7 credits", note: "Lower on higher plans" },
    { type: "Long YouTube (1-3 hours)", cost: "13-15 credits", note: "Lower on higher plans" }
  ],

  faqs: [
    {
      q: "How do credits work?",
      a: "Every summary 'debits' your balance. An article is 1 credit. YouTube videos cost more because processing up to 3 hours of video involves significant AI resource usage. You can see your remaining balance in your account settings at any time."
    },
    {
      q: "What counts as an 'error'?",
      a: "If my system fails to process a link due to a technical glitch on my end, no credits are deducted. If you provide a private video or a link I can't access, I try to detect that before any credits are used."
    },
    {
      q: "Why is YouTube blocked on Free?",
      a: "Processing YouTube videos involves multi-stage AI analysis and high API costs. I keep the Free plan sustainable by focusing it on high-quality article and Reddit summaries."
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes. No contracts or complex cancellation processes. You can manage your subscription and billing directly through the Polar Customer Portal in your settings."
    },
    {
      q: "Who is behind Fewwords?",
      a: "I am an independent developer focused on building the most efficient content consumption tool. I don't sell your data; I only make money if the tool is useful enough for you to pay for it."
    }
  ],

  footer_cta: {
    headline: "Ready to save hours of reading?",
    subheadline: "Join thousands of people who get the point, faster.",
    cta_primary: "Sign Up Free",
    cta_secondary: "Try a Summary",
    cta_authenticated: "Back to Tool"
  }
};

export default pricingCopy;
