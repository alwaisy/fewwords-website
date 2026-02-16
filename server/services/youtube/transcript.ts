import { TRANSCRIPT_PROMPTS, type TranscriptPromptSize } from "../../prompts/youtube/transcript";
import { callOpenRouter } from "../shared/llm";

import { TRANSCRIPT_CONFIG } from "./config";

export interface TranscriptResult {
  text: string;
  model: string;
  reasoningEffort: string;
  size: TranscriptPromptSize;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    reasoningTokens?: number;
  };
  timeMs: number;
}

/**
 * Fetch transcript from video using Gemini
 * Caches in database for reuse
 */
export async function fetchTranscript(
  url: string,
  duration: number,
): Promise<TranscriptResult> {
  const startTime = Date.now();

  // Determine size category based on duration
  let size: TranscriptPromptSize;
  if (duration <= 60) {
    size = "MEDIUM";
  } else if (duration <= 120) {
    size = "LONG";
  } else {
    size = "SUPERLONG";
  }

  const config = TRANSCRIPT_CONFIG[size];
  const prompt = TRANSCRIPT_PROMPTS[size];

  const result = await callOpenRouter({
    model: config.model,
    reasoning: config.reasoning,
    messages: [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract the full transcript from this video.",
          },
          {
            type: "input_video",
            videoUrl: { url },
          },
        ],
      },
    ],
  });

  if (!result.content || result.content.trim().length === 0) {
    throw new Error("Transcript extraction failed: Empty response");
  }

  return {
    text: result.content,
    model: config.model,
    reasoningEffort: config.reasoning?.effort || "low",
    size,
    usage: {
      promptTokens: result.usage?.promptTokens || 0,
      completionTokens: result.usage?.completionTokens || 0,
      totalTokens: result.usage?.totalTokens || 0,
      reasoningTokens: result.usage?.reasoningTokens,
    },
    timeMs: Date.now() - startTime,
  };
}
