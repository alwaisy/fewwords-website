const config = useRuntimeConfig();

// Define a local interface for the API's message structure
interface OpenRouterMessageResponse {
  role?: string;
  content?: string | Array<{ type: string; text?: string }>;
  reasoning?: string;
}

export type Role = "system" | "user" | "assistant" | "tool";

export interface TextPart {
  type: "text";
  text: string;
}

export interface ImagePart {
  type: "image_url";
  imageUrl: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
}

export interface VideoPart {
  type: "video_url";
  videoUrl: {
    url: string;
  };
}

// SDK transforms video_url → input_video internally, so we support both in type
export type ContentPart =
  | TextPart
  | ImagePart
  | VideoPart
  | { type: "input_video"; videoUrl: { url: string } };

export interface Message {
  role: Role;
  content: string | ContentPart[];
  name?: string;
}

export interface ReasoningOptions {
  effort?: "xhigh" | "high" | "medium" | "low" | "minimal" | "none";
  max_tokens?: number;
  exclude?: boolean;
}

export interface OpenRouterOptions {
  model: string;
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  reasoning?: ReasoningOptions;
  tools?: Record<string, unknown>[]; 
  toolChoice?:
    | "auto"
    | "none"
    | "required"
    | { type: "function"; function: { name: string } };
  nitro?: boolean; // Enable Nitro mode (default: true for OpenRouter models)
  provider?: {
    order?: string[];
    allow_fallbacks?: boolean;
    ignore?: string[];
  };
}

export interface OpenRouterResult {
  content: string;
  model: string;
  reasoning?: string;
  finishReason: string | null;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    reasoningTokens?: number;
  };
}

// Helper function to add Nitro suffix to model
const withNitro = (model: string, enabled = true): string => {
  if (!enabled) return model;
  if (model.includes(":nitro")) return model; // Already has Nitro suffix
  return `${model}:nitro`;
};

export async function callOpenRouter(
  options: OpenRouterOptions,
): Promise<OpenRouterResult> {
  try {
    const apiMessages = options.messages.map((msg) => {
      if (typeof msg.content === "string") {
        return { role: msg.role, content: msg.content };
      }

      const contentParts = msg.content.map((part) => {
        // Map our video_url custom format back to what the API expects or handles
        if (part.type === "video_url") {
          return {
            type: "input_video" as const,
            videoUrl: part.videoUrl,
          };
        }
        return part;
      });

      return { role: msg.role, content: contentParts };
    });

    const body: Record<string, unknown> = {
      model: withNitro(options.model, options.nitro !== false),
      messages: apiMessages,
      stream: false,
    };

    if (options.temperature !== undefined) body.temperature = options.temperature;
    if (options.maxTokens !== undefined) body.max_tokens = options.maxTokens;
    if (options.topP !== undefined) body.top_p = options.topP;
    if (options.reasoning) body.reasoning = options.reasoning;
    if (options.tools) body.tools = options.tools;
    if (options.toolChoice) body.tool_choice = options.toolChoice;
    if (options.provider) body.provider = options.provider;

    const response = await $fetch<{
      choices?: Array<{
        message?: unknown;
        finishReason?: string;
      }>;
      usage?: {
        prompt_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
        completion_tokens_details?: {
          reasoning_tokens?: number;
        };
      };
    }>('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.private.openrouterKey}`,
        'HTTP-Referer': 'https://fewwords.app',
        'X-Title': 'Fewwords',
        'Content-Type': 'application/json'
      },
      body
    });

    if (!response?.choices?.length) {
      throw new Error("OpenRouter returned an empty response.");
    }

    const choice = response.choices[0];
    if (!choice) {
      throw new Error("OpenRouter returned undefined choice.");
    }

    const message = choice.message as OpenRouterMessageResponse;

    let contentString: string | null = null;
    if (typeof message.content === "string") {
      contentString = message.content;
    } else if (Array.isArray(message.content)) {
      contentString = message.content
        .filter((c) => c.type === "text")
        .map((c) => c.text)
        .join("\n");
    }

    return {
      content: contentString || "",
      model: options.model,
      reasoning: message.reasoning || undefined,
      finishReason: choice.finishReason || null,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
        reasoningTokens: response.usage?.completion_tokens_details?.reasoning_tokens,
      },
    };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'data' in error) {
      const errWithData = error as { data: { error?: { message?: string } } };
      console.error("❌ OpenRouter API Error Response:", JSON.stringify(errWithData.data, null, 2));
      throw new Error(errWithData.data?.error?.message || "OpenRouter API request failed");
    } else if (error instanceof Error) {
      console.error("❌ OpenRouter Request Error:", error.message);
    }
    throw error;
  }
}