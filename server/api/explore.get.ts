import { eq, desc, count, and, isNotNull, isNull } from "drizzle-orm";

import { summaries } from "~~/database/orm/schema";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 16;
  const offset = (page - 1) * limit;

  const db = await useDb(event);

  // Get total count for pagination (only completed summaries with content)
  const countResult = await db
    .select({ totalCount: count() })
    .from(summaries)
    .where(
      and(
        eq(summaries.status, 'completed'),
        isNotNull(summaries.summary),
        isNull(summaries.errorMessage),
        eq(summaries.isPublic, true),
        eq(summaries.isHidden, false)
      )
    );

  const total = countResult[0]?.totalCount ?? 0;

  // Get completed summaries with pagination
  const exploreSummaries = await db
    .select({
      summaryId: summaries.summaryId,
      title: summaries.title,
      source: summaries.source,
      essence: summaries.essence,
      createdAt: summaries.createdAt,
    })
    .from(summaries)
    .where(
      and(
        eq(summaries.status, 'completed'),
        isNotNull(summaries.summary),
        isNull(summaries.errorMessage),
        eq(summaries.isPublic, true),
        eq(summaries.isHidden, false)
      )
    )
    .orderBy(desc(summaries.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    summaries: exploreSummaries,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
});
