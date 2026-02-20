import { eq } from 'drizzle-orm'

import { redis } from '../../lib/redis'
import { summarize as summarizeArticle, type ArticleMetadata } from '../../services/article'
import { summarize as summarizeReddit } from '../../services/reddit'
import { summarize as summarizeYouTube } from '../../services/youtube'

import { summaries, articles, youtube } from '~~/db/schema'

// Helper to set stage in Redis for SSE (only for YouTube)
async function setCompletedStage(summaryId: string | undefined) {
  if (!summaryId) return;
  try {
    console.log(`[SSE Stage] Setting 'completed' stage for ${summaryId}...`);
    await redis.set(`summary:${summaryId}:stage`, 'completed', 'EX', 3600);
    console.log(`[SSE Stage] ✓ Set 'completed' stage for ${summaryId}`);
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

  if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
    return 'youtube'
  }

  if (urlObj.hostname.includes('reddit.com')) {
    return 'reddit'
  }

  return 'article'
}

export default defineEventHandler(async (event) => {
  const db = await useDb(event)
  const session = await getUserSession(event)
  const userId = session?.user ? (session.user as { id: string }).id : null
  const startTime = Date.now()

  let updateSummaryId: string | undefined
  let url: string | undefined

  try {
    const body = await readBody(event)
    updateSummaryId = body.updateSummaryId
    url = body.url

    if (!url) {
      throw createError({
        statusCode: 400,
        statusMessage: 'URL is required',
      })
    }

    const essence = detectContentType(url)

    // ═══════════════════════════════════════════════════════════
    // IDEMPOTENCY CHECK: If record already processed/processing, don't restart
    // This is a defense-in-depth measure to prevent duplicate processing
    // ═══════════════════════════════════════════════════════════
    if (updateSummaryId) {
      const existing = await db
        .select({ status: summaries.status, isBackgroundJob: summaries.isBackgroundJob })
        .from(summaries)
        .where(eq(summaries.summaryId, updateSummaryId))
        .limit(1);

      if (existing.length > 0 && existing[0]) {
        const { status } = existing[0];

        // Already done or in progress - return current state
        if (status === "processing" || status === "completed") {
          console.log(`[API] Idempotency check: ${updateSummaryId} is ${status}, skipping`);
          return {
            summaryId: updateSummaryId,
            status,
            message: status === "completed" ? "Already completed" : "Already processing",
          };
        }

        // Failed - could allow retry, but for now return failure
        if (status === "failed") {
          return {
            summaryId: updateSummaryId,
            status: "failed",
            message: "Previous attempt failed. Contact support to retry.",
          };
        }
      }
    }

    let result

    switch (essence) {
      case 'article':
        result = await summarizeArticle(url)
        break
      case 'youtube':
        result = await summarizeYouTube(url, db, updateSummaryId)
        break
      case 'reddit':
        result = await summarizeReddit(url)
        break
    }

    const responseTimeMs = Date.now() - startTime

    // Extract reasoning (articles have it, YouTube has it from classifier)
    const reasoning = 'reasoning' in result ? (result as { reasoning?: string }).reasoning : undefined

    // Get summary record ID for metadata relation
    let summaryInternalId: string | undefined

    if (updateSummaryId) {
      // Fetch the original createdAt for total time calculation
      const existingSummary = await db.select({ id: summaries.id, createdAt: summaries.createdAt })
        .from(summaries)
        .where(eq(summaries.summaryId, updateSummaryId))
        .limit(1)
      
      const originalCreatedAt = existingSummary[0]?.createdAt

      const updated = await db.update(summaries)
        .set({
          title: result.title,
          summary: result.summary,
          model: result.model,
          promptId: result.promptId,
          reasoning,
          reasoningEffort: (result as { reasoning_effort?: string }).reasoning_effort,
          reasoningTokens: (result as { reasoning_tokens?: number }).reasoning_tokens,
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

      // Store article metadata if essence is article
      if (essence === 'article' && summaryInternalId && 'metadata' in result) {
        const metadata = (result as { metadata: ArticleMetadata }).metadata
        await db.insert(articles).values({
          summaryId: summaryInternalId,
          metaTitle: metadata.metaTitle,
          metaDescription: metadata.metaDescription,
          domain: metadata.domain,
          author: metadata.author,
          publishedAt: metadata.publishedAt,
          wordCount: metadata.wordCount,
          readingTimeMinutes: metadata.readingTimeMinutes,
          classifierModel: metadata.classifierModel,
          classifierPromptTokens: metadata.classifierPromptTokens,
          classifierCompletionTokens: metadata.classifierCompletionTokens,
          classifierTotalTokens: metadata.classifierTotalTokens,
          classifierTimeMs: metadata.classifierTimeMs,
        }).onConflictDoNothing() // Avoid duplicate inserts

        // Store total cycle time
        if (originalCreatedAt) {
          await storeTotalTime(db, summaryInternalId, essence, originalCreatedAt, completedAt)
        }
      }

      // Store total cycle time for YouTube (article record already created in service)
      if (essence === 'youtube' && summaryInternalId && originalCreatedAt) {
        await storeTotalTime(db, summaryInternalId, essence, originalCreatedAt, completedAt)
      }

      // Log what was written to DB
      console.log(`[DB Update] Summary ${updateSummaryId} updated: title="${result.title?.substring(0, 50)}...", summary=${result.summary ? '(exists)' : '(null)'}`);

      // Set completed stage AFTER DB write for SSE (fixes race condition)
      await setCompletedStage(updateSummaryId)

      return {
        summaryId: updateSummaryId,
        title: result.title,
        summary: result.summary,
      }
    }

    const insertResult = await db.insert(summaries).values({
      source: url,
      essence,
      title: result.title,
      summary: result.summary,
      model: result.model,
      promptId: result.promptId,
      reasoning,
      reasoningEffort: (result as { reasoning_effort?: string }).reasoning_effort,
      reasoningTokens: (result as { reasoning_tokens?: number }).reasoning_tokens,
      promptTokens: result.usage?.promptTokens,
      completionTokens: result.usage?.completionTokens,
      totalTokens: result.usage?.totalTokens,
      responseTimeMs,
      status: 'completed',
      userId,
    }).returning({ id: summaries.id, summaryId: summaries.summaryId })

    const insertedRecord = insertResult[0]
    const summaryId = insertedRecord?.summaryId
    summaryInternalId = insertedRecord?.id

    // Store article metadata if essence is article
    if (essence === 'article' && summaryInternalId && 'metadata' in result) {
      const metadata = (result as { metadata: ArticleMetadata }).metadata
      await db.insert(articles).values({
        summaryId: summaryInternalId,
        metaTitle: metadata.metaTitle,
        metaDescription: metadata.metaDescription,
        domain: metadata.domain,
        author: metadata.author,
        publishedAt: metadata.publishedAt,
        wordCount: metadata.wordCount,
        readingTimeMinutes: metadata.readingTimeMinutes,
        classifierModel: metadata.classifierModel,
        classifierPromptTokens: metadata.classifierPromptTokens,
        classifierCompletionTokens: metadata.classifierCompletionTokens,
        classifierTotalTokens: metadata.classifierTotalTokens,
        classifierTimeMs: metadata.classifierTimeMs,
      })
    }

    // Log what was written to DB
    console.log(`[DB Insert] Summary ${summaryId} inserted: title="${result.title?.substring(0, 50)}...", summary=${result.summary ? '(exists)' : '(null)'}`);

    // Set completed stage AFTER DB write for SSE (fixes race condition)
    await setCompletedStage(summaryId)

    return {
      summaryId,
      title: result.title,
      summary: result.summary,
    }
  }
  catch (error: unknown) {
    console.error('Summarize API error:', error)

    if (updateSummaryId) {
      const errorMessage = error && typeof error === 'object' && 'message' in error
        ? String(error.message)
        : 'Failed to process URL'

      await db.update(summaries)
        .set({
          status: 'failed',
          errorMessage,
        })
        .where(eq(summaries.summaryId, updateSummaryId))

      throw createError({
        statusCode: 500,
        statusMessage: errorMessage,
      })
    }

    throw error
  }
})
