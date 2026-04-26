import { desc, eq } from "drizzle-orm";

import type { UserRole } from "~~/database/orm/schema";
import { articles, summaries, youtube, users } from "~~/database/orm/schema";

/**
 * Admin-only endpoint to get all summaries with pagination and filtering
 * Query params:
 * - page: number (default: 0)
 * - pageSize: number (default: 10)
 * - sortBy: string (default: createdAt)
 * - sortOrder: 'asc' | 'desc' (default: desc)
 * - search: string (filters title, summaryId, or user email)
 * - status: string (filters by status)
 * - essence: string (filters by essence type)
 * - model: string (filters by model)
 * - userId: string (filters by specific user)
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
  const pageSize = Number(query.pageSize) || 10;
  const sortBy = (query.sortBy as string) || "createdAt";
  const sortOrder = (query.sortOrder as "asc" | "desc") || "desc";
  const search = (query.search as string) || "";
  const status = (query.status as string) || "";
  const essence = (query.essence as string) || "";
  const model = (query.model as string) || "";
  const userIdFilter = (query.userId as string) || "";

  const db = await useDb(event);

  // Fetch with user join
  const allSummariesWithUsers = await db
    .select({
      summary: summaries,
      user: {
        id: users.id,
        email: users.email,
        name: users.name,
      }
    })
    .from(summaries)
    .leftJoin(users, eq(summaries.userId, users.id))
    .orderBy(desc(summaries.createdAt));

  let filtered = allSummariesWithUsers;

  // Apply filters
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(row => 
      row.summary.title?.toLowerCase().includes(s) || 
      row.summary.summaryId.toLowerCase().includes(s) ||
      row.user?.email.toLowerCase().includes(s) ||
      row.user?.name.toLowerCase().includes(s)
    );
  }

  if (status) {
    filtered = filtered.filter(row => row.summary.status === status);
  }

  if (essence) {
    filtered = filtered.filter(row => row.summary.essence === essence);
  }

  if (model) {
    filtered = filtered.filter(row => row.summary.model === model);
  }

  if (userIdFilter) {
    filtered = filtered.filter(row => row.summary.userId === userIdFilter);
  }

  // Sorting
  filtered.sort((a, b) => {
    const aVal = a.summary[sortBy as keyof typeof a.summary];
    const bVal = b.summary[sortBy as keyof typeof b.summary];
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const total = filtered.length;
  const startIndex = page * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  // Fetch relations for the paginated set
  const data = await Promise.all(
    paginated.map(async (row) => {
      let youtubeData = null;
      let articleData = null;

      if (row.summary.essence === "youtube") {
        const yt = await db.select().from(youtube).where(eq(youtube.summaryId, row.summary.id)).limit(1);
        youtubeData = yt[0] || null;
      } else if (row.summary.essence === "article") {
        const art = await db.select().from(articles).where(eq(articles.summaryId, row.summary.id)).limit(1);
        articleData = art[0] || null;
      }

      return {
        ...row.summary,
        user: row.user,
        youtube: youtubeData,
        article: articleData,
      };
    })
  );

  return {
    data,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
    filterOptions: {
      essences: ["article", "youtube", "reddit"],
      statuses: ["pending", "processing", "completed", "failed"],
      models: [...new Set(allSummariesWithUsers.map((row) => row.summary.model).filter(Boolean))].sort() as string[],
    },
  };
});
