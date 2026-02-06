import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenAIResult {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface OpenAIOptions {
  model: string;
  messages: Array<OpenAIMessage>;
}

export async function callOpenAI(options: OpenAIOptions): Promise<OpenAIResult> {
  const messages: ChatCompletionMessageParam[] = options.messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));

  const completion = await client.chat.completions.create({
    model: options.model,
    messages,
  });

  const choice = completion.choices[0];
  if (!choice) {
    throw new Error("OpenAI: No choice in response");
  }

  return {
    content: choice.message.content || "",
    model: options.model,
    usage: {
      promptTokens: completion.usage?.prompt_tokens || 0,
      completionTokens: completion.usage?.completion_tokens || 0,
      totalTokens: completion.usage?.total_tokens || 0,
    },
  };
}
