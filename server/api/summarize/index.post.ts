import { summarize as summarizeArticle } from '../../services/article'
import { summarize as summarizeYouTube } from '../../services/youtube'
import { summarize as summarizeReddit } from '../../services/reddit'
import { summaries } from '~~/db/schema'
import { eq } from 'drizzle-orm'

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

    if (updateSummaryId) {
      await db.update(summaries)
        .set({
          title: result.title,
          summary: result.summary,
          model: result.model,
          promptId: result.promptId,
          reasoning,
          promptTokens: result.usage?.promptTokens,
          completionTokens: result.usage?.completionTokens,
          totalTokens: result.usage?.totalTokens,
          responseTimeMs,
          status: 'completed',
          completedAt: new Date(),
        })
        .where(eq(summaries.summaryId, updateSummaryId))

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
      promptTokens: result.usage?.promptTokens,
      completionTokens: result.usage?.completionTokens,
      totalTokens: result.usage?.totalTokens,
      responseTimeMs,
      status: 'completed',
    }).returning({ id: summaries.id, summaryId: summaries.summaryId })

    const insertedRecord = insertResult[0]
    const summaryId = insertedRecord?.summaryId

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
