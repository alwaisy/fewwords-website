import { WRITING_GUIDELINES } from "../../prompts/system";
import { DIRECT_PROMPT, PROMPT_META } from "../../prompts/youtube/direct";
import { callOpenRouter } from "../shared/llm";

import { DIRECT_SUMMARIZATION_CONFIG } from "./config";
import type { YouTubeVideoMetadata, YouTubeChannelMetadata } from "./metadata";

export interface DirectSummaryResult {
  content: string;
  model: string;
  promptId: string;
  reasoningEffort: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    reasoningTokens?: number;
  };
  timeMs: number;
}

/**
 * Direct summarization for short videos (5-20 min)
 * Skips classification and transcript caching
 */
export async function summarizeDirectVideo({
  url,
  video,
  channel,
}: {
  url: string;
  video: YouTubeVideoMetadata;
  channel: YouTubeChannelMetadata;
}): Promise<DirectSummaryResult> {
  const startTime = Date.now();

  // Build enriched prompt with full metadata
  const enrichedPrompt = `
FULL METADATA:
- Title: ${video.title}
- Description: ${video.description || 'N/A'}
- Channel: ${channel.title}
- Duration: ${video.durationMinutes} minutes
- Tags: ${video.tags?.slice(0, 10).join(', ') || 'N/A'}
- Age Restricted: ${video.isAgeRestricted ? 'Yes' : 'No'}

${DIRECT_PROMPT}
`.trim()

  const result = await callOpenRouter({
    model: DIRECT_SUMMARIZATION_CONFIG.model,
    reasoning: DIRECT_SUMMARIZATION_CONFIG.reasoning,
    messages: [
      {
        role: "system",
        content: WRITING_GUIDELINES,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: enrichedPrompt,
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
    throw new Error("Direct summarization failed: Empty response");
  }

  return {
    content: result.content,
    model: DIRECT_SUMMARIZATION_CONFIG.model,
    promptId: PROMPT_META.ID,
    reasoningEffort: DIRECT_SUMMARIZATION_CONFIG.reasoning?.effort || "low",
    usage: {
      promptTokens: result.usage?.promptTokens || 0,
      completionTokens: result.usage?.completionTokens || 0,
      totalTokens: result.usage?.totalTokens || 0,
      reasoningTokens: result.usage?.reasoningTokens,
    },
    timeMs: Date.now() - startTime,
  };
}
