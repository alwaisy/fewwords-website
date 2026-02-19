import { eq, desc, count, and, ne } from "drizzle-orm";

import { summaries } from "~~/db/schema";

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
    .from(summaries)
    .where(and(eq(summaries.userId, userId), ne(summaries.status, 'failed')));

  const totalCount = countResult[0]?.totalCount || 0;

  // Get user's summaries with pagination (excluding failed)
  const userSummaries = await db
    .select({
      summaryId: summaries.summaryId,
      title: summaries.title,
      source: summaries.source,
      essence: summaries.essence,
      createdAt: summaries.createdAt,
      status: summaries.status,
    })
    .from(summaries)
    .where(and(eq(summaries.userId, userId), ne(summaries.status, 'failed')))
    .orderBy(desc(summaries.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    summaries: userSummaries,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
});
