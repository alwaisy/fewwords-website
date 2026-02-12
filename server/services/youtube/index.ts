import { eq } from "drizzle-orm";

import { YOUTUBE_PROMPTS, type YouTubeVideoType } from "../../prompts/youtube";

import { classifyVideo } from "./classifier";
import { YOUTUBE_CLASSIFIER_CONFIG, YOUTUBE_SUMMARIZER_CONFIG } from "./config";
import { fetchYouTubeMetadata } from "./metadata";
import { summarizeVideo } from "./summarizer";

import { summaries, youtube } from "~~/db/schema";
import { redis } from "~~/server/lib/redis";

export interface YouTubeResult {
  url: string;
  type: string;
  title: string;
  summary: string;
  model: string;
  promptId: string;
  reasoning: string;
  reasoning_effort?: string;
  reasoning_tokens?: number;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Stage types for YouTube processing pipeline
type YouTubeStage = "metadata" | "classifying" | "summarizing" | "completed";

// Helper function to set stage in Redis and trigger SSE update
async function setStage(summaryId: string, stage: YouTubeStage) {
  if (!summaryId) {
    console.log(`[YouTube Stage] ⚠ No summaryId, skipping setStage(${stage})`);
    return;
  }

  try {
    const key = `summary:${summaryId}:stage`;
    console.log(`[YouTube Stage] → Setting ${key} = "${stage}"`);
    await redis.set(key, stage, "EX", 3600);

    // Verify it was set
    const verify = await redis.get(key);
    console.log(`[YouTube Stage] ✓ Verified: ${key} = "${verify}"`);
  } catch (error) {
    console.error(`[YouTube Stage] ✗ Failed to set stage "${stage}" for ${summaryId}:`, error);
  }
}

export async function summarize(
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db?: any,
  summaryId?: string,
): Promise<YouTubeResult> {
  // Block YouTube Shorts immediately
  if (url.includes("youtube.com/shorts") || url.includes("youtu.be/")) {
    const isShort =
      url.includes("/shorts/") ||
      (url.includes("youtu.be/") && url.length < 30); // Short youtu.be URLs are likely shorts

    if (isShort) {
      // Save to summaries table if summaryId provided
      if (db && summaryId) {
        await db
          .update(summaries)
          .set({
            title: "YouTube Short",
            summary:
              "**YouTube Shorts are not supported.**\n\nShorts are too brief to summarize meaningfully. Try a full-length video instead.",
            model: "N/A",
            promptId: "N/A",
            reasoning: "YouTube Shorts are too short for summarization",
            status: "completed",
            completedAt: new Date(),
          })
          .where(eq(summaries.summaryId, summaryId));
      }

      return {
        url,
        type: "youtube",
        title: "YouTube Short",
        summary:
          "**YouTube Shorts are not supported.**\n\nShorts are too brief to summarize meaningfully. Try a full-length video instead.",
        model: "N/A",
        promptId: "N/A",
        reasoning: "YouTube Shorts are too short for summarization",
      };
    }
  }

  // Extract videoId from URL for database
  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&\s]+)/,
      /(?:youtu\.be\/)([^\s?]+)/,
      /(?:youtube\.com\/embed\/)([^\s?]+)/,
      /(?:youtube\.com\/v\/)([^\s?]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) return match[1];
    }

    return null;
  };

  const videoId = extractVideoId(url);

  // Clear any old stage data before starting
  if (summaryId) {
    try {
      await redis.del(`summary:${summaryId}:stage`);
      console.log(`[YouTube Stage] ✓ Cleared old stage data for ${summaryId}`);
    } catch (error) {
      console.error(`[YouTube Stage] Failed to clear old stage:`, error);
    }
  }

  // Stage 1: Set metadata stage
  await setStage(summaryId || "", "metadata");

  // Stage 1: Fetch metadata from YouTube Data API
  const { video, channel } = await fetchYouTubeMetadata(
    url,
    process.env.YOUTUBE_DATA_API_KEY!,
  );

  // Stage 1 save: Insert video metadata to youtube table
  if (db && summaryId && videoId) {
    // Get internal UUID from summaryId
    const summaryRecord = await db
      .select({ id: summaries.id })
      .from(summaries)
      .where(eq(summaries.summaryId, summaryId))
      .limit(1);

    const internalId = summaryRecord[0]?.id;

    if (internalId) {
      // Check if YouTube record already exists for this summaryId
      const existing = await db
        .select()
        .from(youtube)
        .where(eq(youtube.summaryId, internalId))
        .limit(1);

      if (existing.length === 0) {
        // Only insert if it doesn't exist
        await db.insert(youtube).values({
          summaryId: internalId,
          videoId,
          originalTitle: video.title,
          description: video.description,
          duration: video.durationMinutes,
          tags: video.tags.length > 0 ? JSON.stringify(video.tags) : null,
          isAgeRestricted: video.isAgeRestricted,
          viewCount: video.statistics.viewCount,
          likeCount: video.statistics.likeCount,
          commentCount: video.statistics.commentCount,
          channelTitle: channel.title,
          channelDescription: channel.description,
          channelSubscriberCount: channel.subscriberCount,
          channelVideoCount: channel.videoCount,
          channelKeywords: channel.keywords || null,
        });
      }
    }
  }

  // Stage 2: Set classifying stage
  await setStage(summaryId || "", "classifying");

  // Stage 2: Classify video (watch video + determine type)
  const classifier = await classifyVideo({
    title: video.title,
    description: video.description,
    channel: video.channelTitle,
    duration: video.durationMinutes,
    videoUrl: url,
    tags: video.tags,
    isAgeRestricted: video.isAgeRestricted,
  });

  // Stage 2 save: Update classifier results
  if (db && summaryId && videoId) {
    const summaryRecord = await db
      .select({ id: summaries.id })
      .from(summaries)
      .where(eq(summaries.summaryId, summaryId))
      .limit(1);

    const internalId = summaryRecord[0]?.id;

    if (internalId) {
      await db
        .update(youtube)
        .set({
          cleanTitle: classifier.clean_title,
          channelBio: classifier.channel_bio,
          category: classifier.category,
          trueIntent: classifier.true_intent,
          focusPoints:
            classifier.focus_points.length > 0
              ? JSON.stringify(classifier.focus_points)
              : null,
          isWorthIt: classifier.is_worth_it,
          classifierReasoning: classifier.reasoning,
          classifierModel: YOUTUBE_CLASSIFIER_CONFIG.model,
          classifierReasoningEffort:
            (YOUTUBE_CLASSIFIER_CONFIG.reasoning?.effort as string) || "low",
          classifierPromptTokens:
            classifier.classifier_usage?.promptTokens || 0,
          classifierCompletionTokens:
            classifier.classifier_usage?.completionTokens || 0,
          classifierTotalTokens: classifier.classifier_usage?.totalTokens || 0,
          classifierReasoningTokens:
            classifier.classifier_usage?.reasoningTokens || 0,
          classifierTimeMs: classifier.classifier_time_ms || 0,
        })
        .where(eq(youtube.videoId, videoId));
    }
  }

  // Early exit if not worth summarizing
  if (!classifier.is_worth_it) {
    // Update summaries table with early exit result
    if (db && summaryId) {
      await db
        .update(summaries)
        .set({
          title: classifier.clean_title || video.title,
          summary: `**Not worth watching.**\n\n${classifier.reasoning}`,
          model: "N/A",
          promptId: "N/A",
          reasoning: classifier.reasoning,
          status: "completed",
          completedAt: new Date(),
        })
        .where(eq(summaries.summaryId, summaryId));
    }

    return {
      url,
      type: "youtube",
      title: classifier.clean_title || video.title,
      summary: `**Not worth watching.**\n\n${classifier.reasoning}`,
      model: "N/A",
      promptId: "N/A",
      reasoning: classifier.reasoning,
    };
  }

  // Stage 3: Set summarizing stage
  await setStage(summaryId || "", "summarizing");

  // Stage 3: Summarize with enriched context
  // Get prompt ID from the actual prompt file
  const promptGetter = YOUTUBE_PROMPTS[classifier.category as YouTubeVideoType];

  let promptId = "youtube-unknown-v1";

  if (promptGetter) {
    const promptModule = await promptGetter();

    promptId =
      (promptModule as { PROMPT_META?: { ID: string } }).PROMPT_META?.ID ||
      `youtube-${classifier.category.toLowerCase()}-v1`;
  }

  console.log(`[YouTube] Starting summarizeVideo for ${summaryId}...`);
  const summaryResult = await summarizeVideo({
    videoUrl: url,
    classifier,
  });
  console.log(`[YouTube] ✓ summarizeVideo completed for ${summaryId}`);

  // Stage "completed" is set by API route AFTER DB write to avoid race condition
  // (SSE will notify frontend only after data is in database)

  return {
    url,
    type: "youtube",
    title: classifier.clean_title,
    summary: summaryResult.content,
    model: YOUTUBE_SUMMARIZER_CONFIG.model,
    promptId,
    reasoning: classifier.reasoning,
    reasoning_effort: YOUTUBE_SUMMARIZER_CONFIG.reasoning?.effort as string,
    reasoning_tokens: (summaryResult.usage as { reasoningTokens?: number })
      ?.reasoningTokens,
    usage: summaryResult.usage || {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    },
  };
}
