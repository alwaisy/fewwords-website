import { eq } from 'drizzle-orm'

import { getRedis } from '../../lib/redis'
import { summarize as summarizeArticle, type ArticleResult } from '../../services/article'
import { deductCredits } from '../../services/quota'
import { summarize as summarizeReddit, type RedditResult } from '../../services/reddit'
import { summarize as summarizeYouTube, type YouTubeResult } from '../../services/youtube'
import { captureRequestFootprint, resolveUserIdentity } from '../../utils/attribution'

import { summaries, articles, youtube } from '~~/database/orm/schema'

// Define a union type for all summary results
type UnifiedSummaryResult = ArticleResult | YouTubeResult | RedditResult;

// Type guards to safely identify the result type
function isArticleResult(result: UnifiedSummaryResult): result is ArticleResult {
  return result.type === 'article';
}

function isYouTubeResult(result: UnifiedSummaryResult): result is YouTubeResult {
  return result.type === 'youtube';
}

// Helper to set stage in Redis for SSE (only for YouTube)
async function setCompletedStage(summaryId: string | undefined) {
  if (!summaryId) return;
  try {
    const redis = getRedis();
    await redis.set(`summary:${summaryId}:stage`, 'completed', 'EX', 3600);
  } catch (error) {
    console.error(`[SSE Stage] Failed to set completed stage:`, error);
  }
}

// Helper to calculate and store total cycle time
async function storeTotalTime(
  db: Awaited<ReturnType<typeof useDb>>,
  summaryInternalId: string,
  essence: 'article' | 'youtube' | 'reddit',
  createdAt: Date,
  completedAt: Date
) {
  const totalTimeMs = completedAt.getTime() - createdAt.getTime()
  
  if (essence === 'article') {
    await db.update(articles)
      .set({ totalTimeMs })
      .where(eq(articles.summaryId, summaryInternalId))
  } else if (essence === 'youtube') {
    await db.update(youtube)
      .set({ totalTimeMs })
      .where(eq(youtube.summaryId, summaryInternalId))
  }
}

function detectContentType(url: string): 'article' | 'youtube' | 'reddit' {
  const urlObj = new URL(url)
  if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) return 'youtube'
  if (urlObj.hostname.includes('reddit.com')) return 'reddit'
  return 'article'
}

export default defineEventHandler(async (event) => {
  const db = await useDb(event)
  const session = await getUserSession(event)
  const userIdFromSession = session?.user ? (session.user as { id: string }).id : null
  const footprint = captureRequestFootprint(event)
  const startTime = Date.now()

  let updateSummaryId: string | undefined
  let url: string | undefined

  try {
    const body = await readBody(event)
    updateSummaryId = body.updateSummaryId
    url = body.url
    const attribution = body.attribution

    // Resolve final userId (handles anonymous shadow users)
    const userId = await resolveUserIdentity(db, userIdFromSession, footprint, attribution);
    const packedAttribution = packAttributionData(footprint, attribution);

    if (!url) {
      throw createError({ statusCode: 400, statusMessage: 'URL is required' })
    }

    const essence = detectContentType(url)

    // 1. Idempotency Check
    if (updateSummaryId) {
      const existing = await db
        .select({ status: summaries.status })
        .from(summaries)
        .where(eq(summaries.summaryId, updateSummaryId))
        .limit(1);

      if (existing.length > 0 && existing[0]) {
        const { status } = existing[0];
        if (status === "processing" || status === "completed") {
          return { summaryId: updateSummaryId, status, message: status === "completed" ? "Already completed" : "Already processing" };
        }
        if (status === "failed") {
          throw createError({ statusCode: 403, statusMessage: "Previous attempt failed. Contact support to retry." });
        }
      }
    }

    // 2. Pre-create summary record if not exists
    let summaryInternalId: string | undefined
    if (!updateSummaryId) {
      const insertResult = await db.insert(summaries).values({
        source: url,
        essence,
        status: 'processing',
        userId,
        ...packedAttribution,
      }).returning({ id: summaries.id, summaryId: summaries.summaryId })

      const insertedRecord = insertResult[0]
      updateSummaryId = insertedRecord?.summaryId
      summaryInternalId = insertedRecord?.id
    }

    // 3. Summarize based on essence
    let result: UnifiedSummaryResult;

    switch (essence) {
      case 'article':
        result = await summarizeArticle(url);
        break;
      case 'youtube':
        result = await summarizeYouTube(url, db, updateSummaryId);
        break;
      case 'reddit':
        result = await summarizeReddit(url);
        break;
    }

    const responseTimeMs = Date.now() - startTime
    const reasoning = 'reasoning' in result ? result.reasoning : undefined

    // 4. Update and Process Result
    if (updateSummaryId) {
      const existingSummary = await db.select({ id: summaries.id, createdAt: summaries.createdAt })
        .from(summaries)
        .where(eq(summaries.summaryId, updateSummaryId))
        .limit(1)
      
      const originalCreatedAt = existingSummary[0]?.createdAt
      const reasoningEffort = 'reasoning_effort' in result ? result.reasoning_effort : undefined;
      const reasoningTokens = 'reasoning_tokens' in result ? result.reasoning_tokens : undefined;

      const updated = await db.update(summaries)
        .set({
          title: result.title,
          summary: result.summary,
          model: result.model,
          promptId: result.promptId,
          reasoning,
          reasoningEffort,
          reasoningTokens,
          promptTokens: result.usage?.promptTokens,
          completionTokens: result.usage?.completionTokens,
          totalTokens: result.usage?.totalTokens,
          responseTimeMs,
          status: 'completed',
          completedAt: new Date(),
          userId,
        })
        .where(eq(summaries.summaryId, updateSummaryId))
        .returning({ id: summaries.id })

      summaryInternalId = updated[0]?.id
      const completedAt = new Date()

      // Deduct Credits
      let durationMinutes: number | undefined;
      if (isYouTubeResult(result) && db && summaryInternalId) {
        const ytData = await db.select({ duration: youtube.duration }).from(youtube).where(eq(youtube.summaryId, summaryInternalId)).limit(1);
        const durationStr = ytData[0]?.duration || "0";
        durationMinutes = parseFloat(durationStr);
      }
      await deductCredits(event, userId, essence, durationMinutes, updateSummaryId);

      // Store Metadata for Articles
      if (isArticleResult(result) && summaryInternalId) {
        await db.insert(articles).values({
          summaryId: summaryInternalId,
          ...result.metadata
        }).onConflictDoNothing();
      }

      if (originalCreatedAt && summaryInternalId) {
        await storeTotalTime(db, summaryInternalId, essence, originalCreatedAt, completedAt);
      }

      await setCompletedStage(updateSummaryId)

      return { summaryId: updateSummaryId, title: result.title, summary: result.summary }
    }

    // This block handles cases where updateSummaryId was somehow lost but result was generated
    return { summaryId: updateSummaryId, title: result.title, summary: result.summary };
  }
  catch (error: unknown) {
    console.error('Summarize API error:', error)
    if (updateSummaryId) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process URL'
      await db.update(summaries).set({ status: 'failed', errorMessage }).where(eq(summaries.summaryId, updateSummaryId))
      throw createError({ statusCode: 500, statusMessage: errorMessage })
    }
    throw error
  }
})
