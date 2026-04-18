import { eq } from 'drizzle-orm'

import { summaries } from '~~/database/orm/schema'

export default defineEventHandler(async (event) => {
  const db = await useDb(event)
  const summaryId = getRouterParam(event, 'summaryId')

  if (!summaryId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'summaryId is required',
    })
  }

  const result = await db.select().from(summaries).where(eq(summaries.summaryId, summaryId)).limit(1)

  if (!result || result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Summary not found',
    })
  }

  const summary = result[0]

  if (!summary) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Summary not found',
    })
  }

  // Handle blocked summaries
  if (summary.isBlocked) {
    const defaultMessage = 'This summary has been blocked by moderators due to content policy violations.';
    throw createError({
      statusCode: 451,
      statusMessage: summary.blockReason || defaultMessage,
    })
  }

  // Return public fields - hide only internal implementation details
  return {
    summaryId: summary.summaryId,
    source: summary.source,
    essence: summary.essence,
    title: summary.title,
    summary: summary.summary,
    status: summary.status,
    errorMessage: summary.errorMessage,
    isBackgroundJob: summary.isBackgroundJob,
    createdAt: summary.createdAt,
    completedAt: summary.completedAt,
  }
})
