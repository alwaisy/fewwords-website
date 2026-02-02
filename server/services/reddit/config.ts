import type { LLMModel } from "../shared/types";

export const REDDIT_CONFIG = {
  provider: "openrouter" as const,
  model: "anthropic/claude-3-5-haiku" as LLMModel,
  temperature: 0.6,
  maxTokens: 1200,
};
