import { desc, eq } from "drizzle-orm";

import type { UserRole } from "~~/db/schema";
import { summaries, youtube, articles } from "~~/db/schema";

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

  // Get all summaries with their related data (youtube/articles)
  const allSummaries = await db
    .select({
      id: summaries.id,
      summaryId: summaries.summaryId,
      source: summaries.source,
      essence: summaries.essence,
      title: summaries.title,
      summary: summaries.summary,
      model: summaries.model,
      promptId: summaries.promptId,
      reasoning: summaries.reasoning,
      reasoningEffort: summaries.reasoningEffort,
      reasoningTokens: summaries.reasoningTokens,
      promptTokens: summaries.promptTokens,
      completionTokens: summaries.completionTokens,
      totalTokens: summaries.totalTokens,
      isPublic: summaries.isPublic,
      responseTimeMs: summaries.responseTimeMs,
      status: summaries.status,
      stage: summaries.stage,
      errorMessage: summaries.errorMessage,
      createdAt: summaries.createdAt,
      completedAt: summaries.completedAt,
      // YouTube specific fields
      youtube: {
        videoId: youtube.videoId,
        duration: youtube.duration,
        category: youtube.category,
        cleanTitle: youtube.cleanTitle,
        classifierReasoningTokens: youtube.classifierReasoningTokens,
        classifierPromptTokens: youtube.classifierPromptTokens,
        classifierCompletionTokens: youtube.classifierCompletionTokens,
        classifierTotalTokens: youtube.classifierTotalTokens,
      },
      // Article specific fields
      article: {
        wordCount: articles.wordCount,
        readingTimeMinutes: articles.readingTimeMinutes,
        classifierPromptTokens: articles.classifierPromptTokens,
        classifierCompletionTokens: articles.classifierCompletionTokens,
        classifierTotalTokens: articles.classifierTotalTokens,
        classifierTimeMs: articles.classifierTimeMs,
      },
    })
    .from(summaries)
    .leftJoin(youtube, eq(summaries.id, youtube.summaryId))
    .leftJoin(articles, eq(summaries.id, articles.summaryId))
    .orderBy(desc(summaries.createdAt));

  // Apply filters
  let filteredSummaries = allSummaries;

  // Apply search filter (title or summaryId contains search term)
  if (search) {
    const searchLower = search.toLowerCase();
    filteredSummaries = filteredSummaries.filter((s) =>
      s.title?.toLowerCase().includes(searchLower) ||
      s.summaryId?.toLowerCase().includes(searchLower)
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

  return {
    data: paginatedSummaries,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
});
