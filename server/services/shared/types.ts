// Provider selection
export type LLMProvider = "openrouter" | "openai" | "anthropic";

// All supported models (any provider/model format)
export type OpenRouterModel =
  | "inception/mercury-2" // not good for writing final summary. avoid
  | "google/gemini-3-flash-preview"
  | "google/gemini-3.1-flash-lite-preview"
  | "google/gemma-4-26b-a4b-it"
  | "prime-intellect/intellect-3" // does not pull out best formating
  | "moonshotai/kimi-k2-thinking" // good result, higher cost due to providers
  | "anthropic/claude-haiku-4-5-20251001"
  | "mistralai/ministral-8b-2512"
  | "x-ai/grok-4.1-fast" // fast but not for final summary writing, still better than mercury-2
  | "qwen/qwen3.5-35b-a3b";

// OpenAI models (for direct OpenAI provider)
export type OpenAIModel = "gpt-5-nano" | "gpt-4.1-2025-04-14";

// Anthropic models (for direct Anthropic provider - no prefix)
export type AnthropicModel = "claude-haiku-4-5-20251001";

export type LLMModel = OpenRouterModel | OpenAIModel | AnthropicModel;
