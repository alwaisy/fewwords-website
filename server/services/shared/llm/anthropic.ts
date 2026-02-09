import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";

import { WRITING_GUIDELINES } from "../../../prompts/system";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AnthropicResult {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AnthropicOptions {
  model: string;
  messages: Array<AnthropicMessage>;
  maxTokens?: number;
}

export async function callAnthropic(
  options: AnthropicOptions,
): Promise<AnthropicResult> {
  const messages: MessageParam[] = options.messages.map(m => ({
    role: m.role,
    content: m.content
  }));

  const completion = await client.messages.create({
    model: options.model,
    messages,
    max_tokens: options.maxTokens || 1000,
    system: WRITING_GUIDELINES,
  });

  // Extract text content, handling Anthropic's complex content block types
  const textBlock = completion.content.find((block) => 
    block.type === "text"
  );

  const text = textBlock && "text" in textBlock ? textBlock.text : "";

  return {
    content: text,
    model: options.model,
    usage: {
      promptTokens: completion.usage?.input_tokens || 0,
      completionTokens: completion.usage?.output_tokens || 0,
      totalTokens:
        (completion.usage?.input_tokens || 0) +
        (completion.usage?.output_tokens || 0),
    },
  };
}
