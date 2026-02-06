import { callLLM } from "../shared/llm";
import { YOUTUBE_CLASSIFIER_CONFIG } from "./config";

export interface VideoMetadata {
  title: string;
  description: string;
  channel: string;
  duration: number;
  videoUrl: string; // YouTube URL to pass to Gemini for video analysis
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
    | "ENTERTAINMENT";
  true_intent: string;
  focus_points: string[];
  is_worth_it: boolean;
  reasoning: string;
  metadata: VideoMetadata; // Include original metadata for Stage 3
  // LLM usage tracking
  classifier_usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    reasoningTokens?: number;
  };
}

const CLASSIFIER_PROMPT = `You are the "fewwords" Metadata Architect and Content Classifier. Your goal is to act as a high-fidelity filter between raw data and a specialized summarizer.

INPUT DATA:

Title: {yt_title}

Description: {yt_desc}

Channel: {yt_channel}

Duration: {yt_duration} minutes

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

NEWS: Announcements, updates, current events.

OPINION: Commentary, reaction, personal take, hot takes.

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
  metadata: VideoMetadata & { videoUrl: string },
): Promise<ClassifierResult> {
  const prompt = CLASSIFIER_PROMPT.replace("{yt_title}", metadata.title)
    .replace("{yt_desc}", metadata.description || "No description available")
    .replace("{yt_channel}", metadata.channel)
    .replace("{yt_duration}", metadata.duration.toString());

  const result = await callLLM({
    provider: YOUTUBE_CLASSIFIER_CONFIG.provider,
    model: YOUTUBE_CLASSIFIER_CONFIG.model,
    prompt,
    reasoning: YOUTUBE_CLASSIFIER_CONFIG.reasoning, // Use reasoning from config
    temperature: YOUTUBE_CLASSIFIER_CONFIG.temperature,
    maxTokens: YOUTUBE_CLASSIFIER_CONFIG.maxTokens,
    // @ts-expect-error - files is not in core types but supported by Gemini via OpenRouter
    files: [
      {
        name: "video",
        mimeType: "video/*",
        url: metadata.videoUrl,
      },
    ],
  });

  try {
    // Try to parse as-is first (for plain JSON)
    let parsed;
    try {
      parsed = JSON.parse(result.content);
    } catch {
      // If that fails, try removing markdown code blocks
      let content = result.content.trim();
      if (content.startsWith("```json")) {
        content = content.replace(/```json\n?/, "").replace(/```$/, "");
      } else if (content.startsWith("```")) {
        content = content.replace(/```\n?/, "").replace(/```$/, "");
      }
      parsed = JSON.parse(content);
    }

    return {
      ...parsed,
      metadata, // Include original metadata
      classifier_usage: result.usage ? {
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
      } : undefined,
    } as ClassifierResult;
  } catch {
    console.error("Failed to parse classifier response:", result.content);
    throw new Error("Classifier returned invalid JSON");
  }
}
