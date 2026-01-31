import { summaries } from '~~/db/schema'
import { eq } from 'drizzle-orm'

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

  // Return summary data as-is (raw markdown string)
  return {
    ...summary,
  }
})
