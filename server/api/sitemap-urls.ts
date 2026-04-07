import { eq, and } from 'drizzle-orm'

import { summaries } from '~~/database/orm/schema'

export default defineEventHandler(async (event) => {
  const db = await useDb(event)
  
  // Fetch all public, completed summaries
  const publicSummaries = await db
    .select({
      summaryId: summaries.summaryId,
      updatedAt: summaries.completedAt,
    })
    .from(summaries)
    .where(
      and(
        eq(summaries.isPublic, true),
        eq(summaries.status, 'completed')
      )
    )

  return publicSummaries.map((s) => ({
    loc: `/app/${s.summaryId}`,
    lastmod: s.updatedAt,
  }))
})
