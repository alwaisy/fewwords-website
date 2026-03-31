
import { desc, eq } from "drizzle-orm";

import { articles, summaries, youtube, type UserRole } from "~~/db/schema";
import { flattenLlmUsage } from "~~/server/lib/admin";

/**
 * Admin-only endpoint to get flattened LLM usage data.
 * Fetches data from summaries, articles, and youtube tables and combines
 * them into a single, flat structure for the LLM Usage admin table.
 *
 * Query params:
 * - page, pageSize, sortBy, sortOrder
 * - search: string (filters on summaryId)
 * - summaryId: string (fetches a single record)
 */
export default defineEventHandler(async (event) => {
  // 1. Verify admin role
  const session = await getUserSession(event);
  if (!session?.user || (session.user as { role?: UserRole }).role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Admin access required",
    });
  }

  const query = getQuery(event);
  const page = Number(query.page) || 0;
  const pageSize = Number(query.pageSize) || 20;
  const summaryId = (query.summaryId as string) || "";

  const db = await useDb(event);

  // 2. Base query to join all relevant tables
  const baseQuery = db
    .select({
      summary: summaries,
      youtube: youtube,
      article: articles,
    })
    .from(summaries)
    .leftJoin(youtube, eq(summaries.id, youtube.summaryId))
    .leftJoin(articles, eq(summaries.id, articles.summaryId))
    .orderBy(desc(summaries.createdAt));

  // 3. Apply filter if a specific summaryId is requested
  if (summaryId) {
    const singleRecord = await baseQuery
      .where(eq(summaries.summaryId, summaryId))
      .limit(1);

    if (!singleRecord || singleRecord.length === 0) {
      return { data: [], meta: { total: 0, page: 0, pageSize, totalPages: 0 } };
    }

    const record = singleRecord[0];
    if (!record) {
      return { data: [], meta: { total: 0, page: 0, pageSize, totalPages: 0 } };
    }

    const flattenedData = flattenLlmUsage(
      record.summary,
      record.youtube,
      record.article,
    );
    return { data: [flattenedData], meta: { total: 1, page: 0, pageSize: 1, totalPages: 1 } };
  }

  // 4. Fetch all records for the main table view
  const allRecords = await baseQuery;

  // 5. Flatten the data and apply in-memory search (if any)
  // In-memory is acceptable for admin panels with moderate data
  const search = (query.search as string) || "";
  const flattenedData = allRecords.map(({ summary, youtube, article }) =>
    flattenLlmUsage(summary, youtube, article)
  );

  const filteredData = search
    ? flattenedData.filter(d => d.summaryId.toLowerCase().includes(search.toLowerCase()))
    : flattenedData;

  // 6. Apply pagination to the final list
  const total = filteredData.length;
  const totalPages = Math.ceil(total / pageSize);
  const paginatedData = filteredData.slice(page * pageSize, (page + 1) * pageSize);

  return {
    data: paginatedData,
    meta: {
      total,
      page,
      pageSize,
      totalPages,
    },
  };
});
