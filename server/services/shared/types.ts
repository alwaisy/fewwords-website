// Provider selection
export type LLMProvider = "openrouter" | "openai" | "anthropic";

// All supported models (any provider/model format)
export type OpenRouterModel =
  | "inception/mercury-2"
  | "google/gemini-3-flash-preview"
  | "prime-intellect/intellect-3"
  | "moonshotai/kimi-k2-thinking"
  | "anthropic/claude-haiku-4-5-20251001"
  | "mistralai/ministral-8b-2512"
  | "x-ai/grok-4.1-fast"
  | "qwen/qwen3.5-35b-a3b";

// OpenAI models (for direct OpenAI provider)
export type OpenAIModel = "gpt-5-nano" | "gpt-4.1-2025-04-14";

// Anthropic models (for direct Anthropic provider - no prefix)
export type AnthropicModel = "claude-haiku-4-5-20251001";

export type LLMModel = OpenRouterModel | OpenAIModel | AnthropicModel;
