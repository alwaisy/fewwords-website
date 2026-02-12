import { desc, eq  } from "drizzle-orm";

import type { UserRole } from "~~/db/schema";
import { articles, summaries, youtube } from "~~/db/schema";

/**
 * Admin-only endpoint to get all summaries with pagination and filtering
 * Query params:
 * - page: number (default: 0)
 * - pageSize: number (default: 10)
 * - sortBy: string (default: createdAt)
 * - sortOrder: 'asc' | 'desc' (default: desc)
 * - search: string (filters title and summaryId)
 * - status: string (filters by status)
 * - essence: string (filters by essence type)
 */
export default defineEventHandler(async (event) => {
  // Verify admin role
  const session = await getUserSession(event);

  if (!session?.user || (session.user as { role?: UserRole }).role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Admin access required",
    });
  }

  const query = getQuery(event);
  const page = Number(query.page) || 0;
  const pageSize = Number(query.pageSize) || 10; // Default to 10 for admin panel
  const sortBy = (query.sortBy as string) || "createdAt";
  const sortOrder = (query.sortOrder as "asc" | "desc") || "desc";
  const search = (query.search as string) || "";
  const status = (query.status as string) || "";
  const essence = (query.essence as string) || "";

  const db = await useDb(event);

  // Get all summaries and apply filters in memory
  // TODO: Move filtering to SQL for production
  const allSummaries = await db
    .select()
    .from(summaries)
    .orderBy(desc(summaries.createdAt));

  let filteredSummaries = allSummaries;

  // Apply search filter (title or summaryId contains search term)
  if (search) {
    const searchLower = search.toLowerCase();
    filteredSummaries = filteredSummaries.filter((s) =>
      s.title?.toLowerCase().includes(searchLower) ||
      s.summaryId.toLowerCase().includes(searchLower)
    );
  }

  // Apply status filter
  if (status) {
    filteredSummaries = filteredSummaries.filter((s) => s.status === status);
  }

  // Apply essence filter
  if (essence) {
    filteredSummaries = filteredSummaries.filter((s) => s.essence === essence);
  }

  // Apply sorting
  filteredSummaries.sort((a, b) => {
    const aVal = a[sortBy as keyof typeof a];
    const bVal = b[sortBy as keyof typeof b];
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Apply pagination
  const total = filteredSummaries.length;
  const startIndex = page * pageSize;
  const paginatedSummaries = filteredSummaries.slice(startIndex, startIndex + pageSize);

  // Fetch related YouTube and Article data for each summary
  const summariesWithRelations = await Promise.all(
    paginatedSummaries.map(async (summary) => {
      let youtubeData = null;
      let articleData = null;

      if (summary.essence === "youtube") {
        const youtubeRecords = await db
          .select()
          .from(youtube)
          .where(eq(youtube.summaryId, summary.id));
        youtubeData = youtubeRecords[0] || null;
      } else if (summary.essence === "article") {
        const articleRecords = await db
          .select()
          .from(articles)
          .where(eq(articles.summaryId, summary.id));
        articleData = articleRecords[0] || null;
      }

      return {
        ...summary,
        youtube: youtubeData,
        article: articleData,
      };
    })
  );

  return {
    data: summariesWithRelations,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
});
