import { summaries } from '~~/db/schema'

export default defineEventHandler(async (event) => {
  const db = await useDb(event)

  try {
    const body = await readBody(event)
    const { url } = body

    if (!url) {
      throw createError({
        statusCode: 400,
        statusMessage: 'URL is required',
      })
    }

    // Detect content type
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

    const essence = detectContentType(url)

    // Create pending record
    const insertResult = await db.insert(summaries).values({
      source: url,
      essence,
      status: 'pending',
      summary: '', // Empty for now
    }).returning({ summaryId: summaries.summaryId })

    const summaryId = insertResult[0]?.summaryId

    if (!summaryId) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create summary record',
      })
    }

    return {
      summaryId,
    }
  }
  catch (error: unknown) {
    console.error('Create pending API error:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create pending record',
    })
  }
})
