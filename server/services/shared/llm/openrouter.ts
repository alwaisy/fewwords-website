import { OpenRouter } from "@openrouter/sdk";

const config = useRuntimeConfig();
const client = new OpenRouter({
  apiKey: config.private.openrouterKey!,
  xTitle: "Fewwords",
  httpReferer: "https://fewwords.app",
});

// Define a local interface for the SDK's message structure
// to avoid using 'any' when accessing custom fields like 'reasoning'
interface OpenRouterMessageResponse {
  role?: string;
  content?: string | Array<{ type: string; text?: string }>;
  reasoning?: string; // This is the field we specifically need
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
  tools?: Record<string, unknown>[]; // Fixed 'any' here
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
  content: string; // Changed from string | null
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
    const sdkMessages = options.messages.map((msg) => {
      if (typeof msg.content === "string") {
        return { role: msg.role, content: msg.content };
      }

      const contentParts = msg.content.map((part) => {
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

    // Build params object - use type assertion to satisfy SDK's internal types
    const generationParams: Record<string, unknown> = {
      model: withNitro(options.model, options.nitro !== false),
      messages: sdkMessages,
      stream: false,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      top_p: options.topP,
    };

    if (options.reasoning) generationParams.reasoning = options.reasoning;
    if (options.tools) generationParams.tools = options.tools;
    if (options.toolChoice) generationParams.tool_choice = options.toolChoice;
    if (options.provider) generationParams.provider = options.provider;

    const completion = (await client.chat.send({
      chatGenerationParams: generationParams as unknown as Parameters<
        typeof client.chat.send
      >[0]["chatGenerationParams"],
    })) as {
      choices: Array<{ message: unknown; finishReason?: string }>;
      usage?: {
        promptTokens?: number;
        completionTokens?: number;
        totalTokens?: number;
      };
    };

    if (!completion?.choices?.length) {
      throw new Error("OpenRouter returned an empty response.");
    }

    const choice = completion.choices[0];
    if (!choice) {
      throw new Error("OpenRouter returned undefined choice.");
    }

    // Cast to our local interface to safely access 'reasoning'
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
        promptTokens: completion.usage?.promptTokens || 0,
        completionTokens: completion.usage?.completionTokens || 0,
        totalTokens: completion.usage?.totalTokens || 0,
        reasoningTokens: (completion.usage as { reasoningTokens?: number })
          ?.reasoningTokens,
      },
    };
  } catch (error: unknown) {
    // Use unknown for errors
    if (error && typeof error === "object" && "data" in error) {
      const errorWithData = error as { data: unknown };
      console.error(
        "❌ OpenRouter SDK Validation Error:",
        JSON.stringify(errorWithData.data, null, 2),
      );
    } else if (error instanceof Error) {
      console.error("❌ OpenRouter API Error:", error.message);
    }
    throw error;
  }
}
