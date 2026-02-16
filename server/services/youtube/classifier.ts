import { WRITING_GUIDELINES } from "../../prompts/system";
import { callOpenRouter } from "../shared/llm";

import { CLASSIFICATION_CONFIG } from "./config";

export interface VideoMetadata {
  title: string;
  description: string;
  channel: string;
  duration: number;
  videoUrl?: string; // Optional: for reference only, not used for processing
  tags?: string[]; // Video tags
  isAgeRestricted?: boolean; // Age-restriction flag
}

export interface ClassifierResult {
  clean_title: string;
  channel_bio: string;
  category:
    | "TUTORIAL"
    | "REVIEW"
    | "NEWS"
    | "OPINION"
    | "INTERVIEW"
    | "EDUCATION"
    | "ENTERTAINMENT"
    | "GENERIC"; // Fallback when classifier fails
  true_intent: string;
  focus_points: string[];
  is_worth_it: boolean;
  reasoning: string;
  metadata: VideoMetadata; // Include original metadata for Stage 3
  classifierModel?: string; // Model used for classification
  // LLM usage tracking
  classifier_usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    reasoningTokens?: number;
  };
  classifier_time_ms?: number; // Time taken for classification
}

const CLASSIFIER_PROMPT = `You are the "fewwords" Metadata Architect and Content Classifier. Your goal is to act as a high-fidelity filter between raw transcript data and a specialized summarizer.

INPUT DATA:

Title: {yt_title}

Description: {yt_desc}

Channel: {yt_channel}

Duration: {yt_duration} minutes

Transcript (first 2000 words):
{transcript_preview}

YOUR TASKS:

STRIP NOISE: From the description, ignore all links, affiliate sponsors, social media handles, and generic "subscribe/like" requests. Extract only the actual content context.

CONTEXTUALIZE: Based on the channel name and description, write a 1-sentence bio for the creator/speaker (e.g., "A senior software engineer specializing in system design").

TRUE INTENT: Identify the actual core purpose of this video. Differentiate between clickbait titles and the real objective.

CATEGORIZE: Pick exactly one category from the list below.

FOCUS POINTS: Identify 3 specific things a viewer would want to extract from this video.

DECISION: Determine if this video has enough informational value to be summarized.

CATEGORY LIST:

TUTORIAL: How-to, walkthrough, guide, coding, DIY.

REVIEW: Product evaluation, comparison, "should you buy."

NEWS: Official announcements, press releases, breaking news reports with factual reporting only. If the video adds analysis, commentary, or personal opinions about news, it's OPINION not NEWS.

OPINION: Commentary, reaction, analysis, personal take, hot takes. Includes videos that discuss/explain news events with opinions.

INTERVIEW: Podcast, conversation, Q&A, guest appearance.

EDUCATION: Lecture, explainer, documentary style.

ENTERTAINMENT: Vlog, gaming, lifestyle, no clear information value.

OUTPUT FORMAT (Strict JSON):

{
"clean_title": "A noise-free version of the video title",
"channel_bio": "1-sentence professional bio of the creator",
"category": "THE_CATEGORY",
"true_intent": "1-sentence summary of what the video actually achieves",
"focus_points": [
"Specific point 1",
"Specific point 2",
"Specific point 3"
],
"is_worth_it": true | false,
"reasoning": "One sentence explaining why it is or isn't worth summarizing."
}`;

export async function classifyVideo(
  transcript: string,
  metadata: VideoMetadata,
): Promise<ClassifierResult> {
  const startTime = Date.now();

  // Preview first 2000 words of transcript for classification
  const transcriptPreview = transcript.split(" ").slice(0, 2000).join(" ");

  const prompt = CLASSIFIER_PROMPT.replace("{yt_title}", metadata.title)
    .replace("{yt_desc}", metadata.description || "No description available")
    .replace("{yt_channel}", metadata.channel)
    .replace("{yt_duration}", metadata.duration.toString())
    .replace("{transcript_preview}", transcriptPreview);

  const result = await callOpenRouter({
    model: CLASSIFICATION_CONFIG.model,
    reasoning: CLASSIFICATION_CONFIG.reasoning,
    messages: [
      {
        role: "system",
        content: WRITING_GUIDELINES,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  // Check for empty/null response
  if (!result.content || result.content.trim().length === 0) {
    console.warn("[Classifier] Empty response, using fallback generic classification");
    return getFallbackClassification(metadata, result.usage, Date.now() - startTime);
  }

  try {
    // Try to parse as-is first (for plain JSON)
    let parsed;
    try {
      parsed = JSON.parse(result.content);
    } catch {
      // If that fails, try removing markdown code blocks
      let content = result.content.trim();

      // Extract content between ```json or ``` and closing ```
      const codeBlockMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        content = codeBlockMatch[1].trim();
      } else {
        // Fallback: strip starting and ending markers manually
        content = content
          .replace(/^```(?:json)?\s*\n?/, '')
          .replace(/\n?```\s*$/, '')
          .trim();
      }

      parsed = JSON.parse(content);
    }

    return {
      ...parsed,
      metadata, // Include original metadata
      classifierModel: CLASSIFICATION_CONFIG.model,
      classifier_usage: result.usage ? {
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
      } : undefined,
      classifier_time_ms: Date.now() - startTime,
    } as ClassifierResult;
  } catch {
    console.error("[Classifier] Failed to parse response, using fallback:", result.content?.substring(0, 200));
    return getFallbackClassification(metadata, result.usage, Date.now() - startTime);
  }
}

// Fallback classification when classifier fails - allows summarization to continue
function getFallbackClassification(
  metadata: VideoMetadata,
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number; reasoningTokens?: number },
  elapsedMs?: number,
): ClassifierResult {
  return {
    clean_title: metadata.title,
    channel_bio: `Content from ${metadata.channel}`,
    category: "GENERIC" as const,
    true_intent: "Video content summary",
    focus_points: [
      "Main topics covered",
      "Key insights shared",
      "Practical takeaways"
    ],
    is_worth_it: true,
    reasoning: "Classification unavailable - using generic summary",
    metadata,
    classifierModel: CLASSIFICATION_CONFIG.model,
    classifier_usage: usage ? {
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      totalTokens: usage.totalTokens,
    } : undefined,
    classifier_time_ms: elapsedMs || 0,
  };
}
