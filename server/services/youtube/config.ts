import type { LLMModel } from "../shared/types";

// Stage 2: Transcript extraction (Gemini required for video processing)
export const TRANSCRIPT_CONFIG = {
  MEDIUM: {
    model: "google/gemini-3-flash-preview" as LLMModel,
    reasoning: {
      effort: "low" as const,
    },
  },
  LONG: {
    model: "google/gemini-3-flash-preview" as LLMModel,
    reasoning: {
      effort: "medium" as const,
    },
  },
  SUPERLONG: {
    model: "google/gemini-3-flash-preview" as LLMModel,
    reasoning: {
      effort: "high" as const,
    },
  },
} as const;

// Direct summarization for short videos (Gemini required for video processing)
export const DIRECT_SUMMARIZATION_CONFIG = {
  model: "google/gemini-3-flash-preview" as LLMModel,
  reasoning: {
    effort: "low" as const,
  },
} as const;

// Stage 3: Classification (cheaper model, text-only)
export const CLASSIFICATION_CONFIG = {
  model: "prime-intellect/intellect-3" as LLMModel,
  temperature: 0.3,
  maxTokens: 500,
  reasoning: undefined,
} as const;

// Stage 4: Summarization (Grok for fast, quality summaries)
export const SUMMARIZATION_CONFIG = {
  model: "google/gemma-4-26b-a4b-it" as LLMModel,
  temperature: 0.7,
  maxTokens: 4000,
  reasoning: undefined,
} as const;

// Legacy configs for backwards compatibility
export const YOUTUBE_CLASSIFIER_CONFIG = CLASSIFICATION_CONFIG;
export const YOUTUBE_SUMMARIZER_CONFIG = SUMMARIZATION_CONFIG;
export const YOUTUBE_CONFIG = YOUTUBE_CLASSIFIER_CONFIG;
