import { eq, desc, count, and, ne } from "drizzle-orm";

import { summaries, savedSummaries } from "~~/database/orm/schema";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const userId = (session.user as { id: string }).id;
  const query = getQuery(event);
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 16;
  const offset = (page - 1) * limit;

  const db = await useDb(event);

  // Get saved summaries with pagination (excluding failed)
  const saved = await db
    .select({
      summaryId: summaries.summaryId,
      title: summaries.title,
      source: summaries.source,
      essence: summaries.essence,
      createdAt: summaries.createdAt,
      status: summaries.status,
      savedAt: savedSummaries.createdAt,
    })
    .from(savedSummaries)
    .innerJoin(summaries, eq(savedSummaries.summaryId, summaries.summaryId))
    .where(and(eq(savedSummaries.userId, userId), ne(summaries.status, 'failed')))
    .orderBy(desc(savedSummaries.createdAt))
    .limit(limit)
    .offset(offset);

  // Get total count for pagination
  const countResult = await db
    .select({ totalCount: count() })
    .from(savedSummaries)
    .innerJoin(summaries, eq(savedSummaries.summaryId, summaries.summaryId))
    .where(and(eq(savedSummaries.userId, userId), ne(summaries.status, 'failed')));

  const totalCount = countResult[0]?.totalCount || 0;

  return {
    summaries: saved,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
});
