import { summarize as summarizeArticle } from '../../services/article'
import { summarize as summarizeYouTube } from '../../services/youtube'
import { summarize as summarizeReddit } from '../../services/reddit'
import { summaries } from '~~/db/schema'

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

  try {
    const body = await readBody(event)
    const { url } = body

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
        result = await summarizeYouTube(url)
        break
      case 'reddit':
        result = await summarizeReddit(url)
        break
    }

    const responseTimeMs = Date.now() - startTime

    // Save to database
    const insertResult = await db.insert(summaries).values({
      source: url,
      essence,
      title: result.title,
      summary: result.summary,
      model: result.model,
      promptTokens: result.usage?.promptTokens,
      completionTokens: result.usage?.completionTokens,
      totalTokens: result.usage?.totalTokens,
      responseTimeMs,
    }).returning({ summaryId: summaries.summaryId })

    const summaryId = insertResult[0]?.summaryId

    return {
      summaryId,
      url: result.url,
      type: essence,
      title: result.title,
      summary: result.summary,
      model: result.model,
    }
  }
  catch (error: unknown) {
    console.error('Summarize API error:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process URL',
    })
  }
})
