// Provider selection
export type LLMProvider = 'openrouter' | 'openai' | 'anthropic'

// OpenRouter models (uses provider/model format)
export type LLMModel =
  | 'google/gemini-3-flash-preview'
  | 'openai/gpt-4.1-mini'
  | 'anthropic/claude-3-5-haiku'
  | 'deepseek/deepseek-chat'

// OpenAI models (for direct OpenAI provider)
export type OpenAIModel =
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-4-turbo'
  | 'gpt-3.5-turbo'

// Anthropic models (for direct Anthropic provider)
export type AnthropicModel =
  | 'claude-3-5-sonnet-20241022'
  | 'claude-3-haiku-20240307'
