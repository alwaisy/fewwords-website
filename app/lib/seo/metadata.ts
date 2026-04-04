const BASE_URL = "https://fewwords.app";
const OG_IMAGE = `${BASE_URL}/og-image.png`;

export const seoMeta = {
  title: "Fewwords: The quick & painless way to read the internet",
  titleTemplate: "%s - Fewwords",
  description:
    "Paste a URL. Get the main points in under a minute. Articles, YouTube, Reddit. Start with 2,500 words free.",

  robots:
    "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",

  themeColor: "#fafaf9",

  ogType: "website" as const,
  ogUrl: `${BASE_URL}/`,
  ogSiteName: "Fewwords",
  ogTitle: "Fewwords: The quick & painless way to read the internet",
  ogDescription:
    "Paste a URL. Get the main points in under a minute. Articles, YouTube, Reddit. No signup needed.",
  ogImage: OG_IMAGE,
  ogImageType: "image/png" as const,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogLocale: "en_US",

  twitterCard: "summary_large_image" as const,
  twitterSite: "@fewwords",
  twitterCreator: "@fewwords",
  twitterTitle: "Fewwords: The quick & painless way to read the internet",
  twitterDescription:
    "Paste a URL. Get the main points in under a minute. Articles, YouTube, Reddit. No signup needed.",
  twitterImage: OG_IMAGE,
  twitterImageType: "image/png" as const,
  twitterImageWidth: 1200,
  twitterImageHeight: 630,
};

export const metaHead = {
  htmlAttrs: { lang: "en" },
  link: [
    { rel: "canonical", href: `${BASE_URL}/` },
    { rel: "icon", href: "/favicon.ico" },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: "/favicon-16x16.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/apple-touch-icon.png",
    },
  ],
  meta: [
    { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=5" }
  ]
};
