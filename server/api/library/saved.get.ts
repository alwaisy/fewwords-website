import { eq, desc, count } from "drizzle-orm";

import { summaries, savedSummaries } from "~~/db/schema";

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

  // Get total count for pagination
  const countResult = await db
    .select({ totalCount: count() })
    .from(savedSummaries)
    .where(eq(savedSummaries.userId, userId));

  const totalCount = countResult[0]?.totalCount || 0;

  // Get saved summaries with pagination
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
    .where(eq(savedSummaries.userId, userId))
    .orderBy(desc(savedSummaries.createdAt))
    .limit(limit)
    .offset(offset);

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
