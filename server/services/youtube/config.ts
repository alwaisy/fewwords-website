// Stage 2: Classifier (Fast model)
export const YOUTUBE_CLASSIFIER_CONFIG = {
  provider: "openrouter" as const,
  model: "google/gemini-3-flash-preview" as const,
  temperature: 0.3,
  maxTokens: 500,
};

// Stage 3: Summarizer (Smart model with reasoning + tools)
export const YOUTUBE_SUMMARIZER_CONFIG = {
  provider: "openrouter" as const,
  model: "google/gemini-3-flash-preview" as const,
  temperature: 0.7,
  maxTokens: 4000,
  reasoning: {
    effort: "high" as const, // Use high reasoning effort for complex video analysis
  },
  tools: {
    // Google Search tool for context
    googleSearch: {
      description: "Search the web for additional context",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query",
          },
        },
        required: ["query"],
      },
    },
    // URL context tool for video analysis
    urlContext: {
      description: "Analyze content from a URL",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "URL to analyze",
          },
        },
        required: ["url"],
      },
    },
  },
};

// Legacy config for backwards compatibility
export const YOUTUBE_CONFIG = YOUTUBE_CLASSIFIER_CONFIG;
