import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText, type Tool } from "ai";
import type { LLMModel, LLMProvider } from "./types";
import { WRITING_GUIDELINES } from "../../prompts/system";

// Provider instances
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  headers: {
    "HTTP-Referer": "https://fewwords.app",
    "X-Title": "Fewwords - Content Summarizer",
  },
});

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Provider registry
const providers = {
  openrouter,
  openai,
  anthropic,
} as const;

export interface LLMOptions {
  model: LLMModel;
  prompt: string;
  content?: string;
  temperature?: number;
  maxTokens?: number;
  provider?: LLMProvider;
  tools?: Record<string, Tool>;
  reasoning?: {
    effort?: "xhigh" | "high" | "medium" | "low" | "minimal" | "none";
    max_tokens?: number;
    exclude?: boolean;
    enabled?: boolean;
  };
}

export interface LLMResult {
  content: string;
  model: string;
  reasoning?: string; // Reasoning tokens/thought process
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export async function callLLM(options: LLMOptions): Promise<LLMResult> {
  const {
    model,
    prompt,
    content,
    temperature = 0.7,
    maxTokens = 1000,
    provider = "openrouter",
  } = options;

  // Build user message
  let userMessage = prompt;
  if (content) {
    userMessage += `\n\nContent:\n\n${content}`;
  }

  try {
    const messages = [
      { role: "system" as const, content: WRITING_GUIDELINES },
      { role: "user" as const, content: userMessage },
    ];

    const baseOptions: Parameters<typeof generateText>[0] = {
      model: providers[provider](model),
      messages,
      temperature,
      maxOutputTokens: maxTokens,
    };

    // Add tools if provided
    if (options.tools) {
      baseOptions.tools = options.tools;
    }

    // Add reasoning config for supported models (Gemini 3, Claude 3.7, etc.)
    if (options.reasoning) {
      // Use @ts-expect-error for provider-specific options
      // @ts-expect-error - reasoning is not in core types but supported by OpenRouter
      baseOptions.reasoning = options.reasoning;
    }

    const response = await generateText(baseOptions);

    // Extract reasoning tokens if present (OpenRouter format)
    const reasoningRaw = response.reasoning || response.reasoningText;

    // Convert reasoning array to string if present
    let reasoningText: string | undefined;
    if (reasoningRaw) {
      if (Array.isArray(reasoningRaw)) {
        reasoningText = reasoningRaw
          .map((r) => (typeof r === "string" ? r : JSON.stringify(r)))
          .join("\n");
      } else if (typeof reasoningRaw === "string") {
        reasoningText = reasoningRaw;
      }
    }

    return {
      content: response.text,
      model,
      reasoning: reasoningText,
      usage: response.usage
        ? {
            promptTokens: response.usage.inputTokens ?? 0,
            completionTokens: response.usage.outputTokens ?? 0,
            totalTokens: response.usage.totalTokens ?? 0,
          }
        : undefined,
    };
  } catch (error) {
    console.error("LLM API error:", error);
    throw new Error(`LLM request failed: ${error}`);
  }
}
