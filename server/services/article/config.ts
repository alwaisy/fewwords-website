import type { LLMModel } from "../shared/types";

export const ARTICLE_CONFIG = {
  model: "google/gemini-3.1-flash-lite-preview" as LLMModel,
  temperature: 0.7,
  maxTokens: 1000,
} as const;

export const CLASSIFIER_CONFIG = {
  model: "qwen/qwen3.5-35b-a3b" as LLMModel,
  thinkingBudgetTokens: 512,
} as const;
