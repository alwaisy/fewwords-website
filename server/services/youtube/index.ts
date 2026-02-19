import { eq } from "drizzle-orm";

import { YOUTUBE_PROMPTS, type YouTubeVideoType } from "../../prompts/youtube";

import { classifyVideo } from "./classifier";
import { SUMMARIZATION_CONFIG } from "./config";
import { fetchYouTubeMetadata, type YouTubeVideoMetadata, type YouTubeChannelMetadata } from "./metadata";
import { summarizeDirectVideo } from "./short-summarizer";
import { summarizeVideo } from "./summarizer";
import { fetchTranscript } from "./transcript";

import { summaries, youtube } from "~~/db/schema";
import { redis } from "~~/server/lib/redis";

export interface YouTubeResult {
  url: string;
  type: string;
  title: string;
  summary: string;
  model: string;
  promptId: string | null;
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
type YouTubeStage = "metadata" | "transcript" | "classifying" | "summarizing" | "completed";

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
  // Extract videoId from URL
  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&\s]+)/,
      /(?:youtu\.be\/)([^\s?]+)/,
      /(?:youtube\.com\/embed\/)([^\s?]+)/,
      /(?:youtube\.com\/v\/)([^\s?]+)/,
      /(?:youtube\.com\/shorts\/)([^\s?]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) return match[1];
    }

    return null;
  };

  const videoId = extractVideoId(url);

  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

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

  const duration = video.durationMinutes;

  // Check for live streams (not supported)
  if (video.isLive) {
    throw new Error("Live streams aren't supported yet. Wait for the stream to end and try again.");
  }

  // Validate video duration - treat as errors, not completed summaries
  if (duration <= 5) {
    throw new Error("Videos under 5 minutes are too brief to summarize meaningfully. Try a longer video.");
  }

  if (duration > 180) {
    throw new Error("Videos over 3 hours exceed the maximum supported length. Try a shorter video.");
  }

  // Save metadata to database
  if (db && summaryId && videoId) {
    await saveMetadata(db, summaryId, videoId, video, channel);
  }

  // ROUTING: Choose flow based on duration
  if (duration > 5 && duration <= 20) {
    // Direct summarization (5-20 min) - skip transcript and classification
    return await directSummarizationFlow(url, video, channel, db, summaryId, videoId);
  }

  // Standard flow (20+ min) - transcript → classification → summarization
  return await standardFlow(url, video, channel, db, summaryId, videoId);
}

// Direct summarization flow for short videos (5-20 min)
async function directSummarizationFlow(
  url: string,
  video: YouTubeVideoMetadata,
  channel: YouTubeChannelMetadata,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db?: any,
  summaryId?: string,
  videoId?: string,
): Promise<YouTubeResult> {
  console.log(`[YouTube] Direct summarization flow for ${summaryId} (${video.durationMinutes}min)`);

  await setStage(summaryId || "", "summarizing");

  const result = await summarizeDirectVideo({
    url,
    video,
    channel,
  });

  const response: YouTubeResult = {
    url,
    type: "youtube",
    title: video.title,
    summary: result.content,
    model: result.model,
    promptId: result.promptId,
    reasoning: "Direct summarization for short video",
    reasoning_effort: result.reasoningEffort,
    reasoning_tokens: result.usage.reasoningTokens,
    usage: result.usage,
  };

  if (db && summaryId) {
    await saveResult(db, summaryId, response, videoId);
    await setStage(summaryId, "completed");
  }

  return response;
}

// Standard flow for longer videos (20+ min)
async function standardFlow(
  url: string,
  video: YouTubeVideoMetadata,
  channel: YouTubeChannelMetadata,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db?: any,
  summaryId?: string,
  videoId?: string,
): Promise<YouTubeResult> {
  console.log(`[YouTube] Standard flow for ${summaryId} (${video.durationMinutes}min)`);

  // Stage 2: Fetch transcript (with database cache check)
  await setStage(summaryId || "", "transcript");

  let transcript;
  const duration = video.durationMinutes;

  // Check database for cached transcript
  if (db && videoId) {
    const cached = await db
      .select()
      .from(youtube)
      .where(eq(youtube.videoId, videoId))
      .limit(1);

    if (cached.length > 0 && cached[0].transcriptText) {
      console.log(`[YouTube] ✓ Using cached transcript for ${videoId}`);
      transcript = {
        text: cached[0].transcriptText,
        model: cached[0].transcriptModel,
        reasoningEffort: cached[0].transcriptReasoningEffort,
        usage: {
          promptTokens: cached[0].transcriptPromptTokens || 0,
          completionTokens: cached[0].transcriptCompletionTokens || 0,
          totalTokens: cached[0].transcriptTotalTokens || 0,
          reasoningTokens: cached[0].transcriptReasoningTokens || 0,
        },
        timeMs: cached[0].transcriptTimeMs || 0,
      };
    }
  }

  // Extract new transcript if not cached
  if (!transcript) {
    console.log(`[YouTube] → Extracting new transcript for ${videoId} (${duration}min)`);
    transcript = await fetchTranscript(url, duration);

    // Save transcript to database
    if (db && videoId) {
      await db
        .update(youtube)
        .set({
          transcriptText: transcript.text,
          transcriptModel: transcript.model,
          transcriptReasoningEffort: transcript.reasoningEffort,
          transcriptPromptTokens: transcript.usage.promptTokens,
          transcriptCompletionTokens: transcript.usage.completionTokens,
          transcriptTotalTokens: transcript.usage.totalTokens,
          transcriptReasoningTokens: transcript.usage.reasoningTokens || 0,
          transcriptTimeMs: transcript.timeMs,
          transcriptCachedAt: new Date(),
        })
        .where(eq(youtube.videoId, videoId));
    }
  }

  // Stage 3: Classify using transcript
  await setStage(summaryId || "", "classifying");

  const classifier = await classifyVideo(transcript.text, {
    title: video.title,
    description: video.description,
    channel: video.channelTitle,
    duration: video.durationMinutes,
    videoUrl: url,
    tags: video.tags,
    isAgeRestricted: video.isAgeRestricted,
  });

  // Save classifier results
  if (db && videoId) {
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
        classifierModel: classifier.classifierModel,
        classifierReasoningEffort: undefined, // No reasoning for text classification
        classifierPromptTokens: classifier.classifier_usage?.promptTokens || 0,
        classifierCompletionTokens: classifier.classifier_usage?.completionTokens || 0,
        classifierTotalTokens: classifier.classifier_usage?.totalTokens || 0,
        classifierReasoningTokens: classifier.classifier_usage?.reasoningTokens || 0,
        classifierTimeMs: classifier.classifier_time_ms || 0,
      })
      .where(eq(youtube.videoId, videoId));
  }

  // Early exit if not worth summarizing
  if (!classifier.is_worth_it) {
    const response: YouTubeResult = {
      url,
      type: "youtube",
      title: classifier.clean_title || video.title,
      summary: `**Not worth watching.**\n\n${classifier.reasoning}`,
      model: "N/A",
      promptId: null,
      reasoning: classifier.reasoning,
    };

    if (db && summaryId) {
      await saveResult(db, summaryId, response);
      await setStage(summaryId, "completed");
    }

    return response;
  }

  // Stage 4: Summarize using transcript
  await setStage(summaryId || "", "summarizing");

  console.log(`[YouTube] Starting summarizeVideo for ${summaryId}...`);
  const summaryResult = await summarizeVideo({
    transcript: transcript.text,
    classifier,
  });
  console.log(`[YouTube] ✓ summarizeVideo completed for ${summaryId}`);

  // Get prompt ID
  const promptGetter = YOUTUBE_PROMPTS[classifier.category as YouTubeVideoType];
  let promptId = "youtube-unknown-v1";

  if (promptGetter) {
    const promptModule = await promptGetter();
    promptId =
      (promptModule as { PROMPT_META?: { ID: string } }).PROMPT_META?.ID ||
      `youtube-${classifier.category.toLowerCase()}-v1`;
  }

  const response: YouTubeResult = {
    url,
    type: "youtube",
    title: classifier.clean_title,
    summary: summaryResult.content,
    model: SUMMARIZATION_CONFIG.model,
    promptId,
    reasoning: classifier.reasoning,
    usage: summaryResult.usage || {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    },
  };

  if (db && summaryId) {
    await saveResult(db, summaryId, response);
    await setStage(summaryId, "completed");
  }

  return response;
}

// Helper: Save metadata to database
async function saveMetadata(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  summaryId: string,
  videoId: string,
  video: YouTubeVideoMetadata,
  channel: YouTubeChannelMetadata,
) {
  // Get internal UUID from summaryId
  const summaryRecord = await db
    .select({ id: summaries.id })
    .from(summaries)
    .where(eq(summaries.summaryId, summaryId))
    .limit(1);

  const internalId = summaryRecord[0]?.id;

  if (!internalId) {
    console.warn(`[YouTube] No internal ID found for ${summaryId}`);
    return;
  }

  // Check if YouTube record already exists
  const existing = await db
    .select()
    .from(youtube)
    .where(eq(youtube.summaryId, internalId))
    .limit(1);

  if (existing.length === 0) {
    // Insert new record
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

// Helper: Save final result to database
async function saveResult(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  summaryId: string,
  result: YouTubeResult,
  _videoId?: string,
) {
  await db
    .update(summaries)
    .set({
      title: result.title,
      summary: result.summary,
      model: result.model,
      promptId: result.promptId,
      reasoning: result.reasoning,
      reasoningEffort: result.reasoning_effort,
      reasoningTokens: result.reasoning_tokens,
      promptTokens: result.usage?.promptTokens || 0,
      completionTokens: result.usage?.completionTokens || 0,
      totalTokens: result.usage?.totalTokens || 0,
      status: "completed",
      completedAt: new Date(),
    })
    .where(eq(summaries.summaryId, summaryId));
}

