
import { count, desc, eq, sql } from "drizzle-orm";

import type { UserRole } from "~~/database/orm/schema";
import { summaries, users } from "~~/database/orm/schema";

/**
 * Admin-only endpoint to get all users with pagination and filtering.
 *
 * Query params:
 * - page: number (default: 0)
 * - pageSize: number (default: 10)
 * - search: string (filters email, name, username)
 * - role: string (filters by role: user | admin)
 */
export default defineEventHandler(async (event) => {
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
  const search = (query.search as string) || "";
  const role = (query.role as string) || "";

  const db = await useDb(event);

  // Subquery: count summaries per user
  const summaryCounts = db
    .select({
      userId: summaries.userId,
      summaryCount: count().as("summary_count"),
    })
    .from(summaries)
    .groupBy(summaries.userId)
    .as("summary_counts");

  // Main query with left join to get summary counts
  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      username: users.username,
      role: users.role,
      emailVerified: users.emailVerified,
      plan: users.plan,
      wordsUsed: users.wordsUsed,
      wordsLimit: users.wordsLimit,
      periodResetAt: users.periodResetAt,
      createdAt: users.createdAt,
      summaryCount: sql<number>`COALESCE(${summaryCounts.summaryCount}, 0)`,
    })
    .from(users)
    .leftJoin(summaryCounts, eq(users.id, summaryCounts.userId))
    .orderBy(desc(users.createdAt));

  // Apply filters in memory (acceptable for admin panel)
  let filteredUsers = allUsers;

  if (search) {
    const searchLower = search.toLowerCase();
    filteredUsers = filteredUsers.filter(
      (u) =>
        u.email.toLowerCase().includes(searchLower) ||
        u.name.toLowerCase().includes(searchLower) ||
        u.username?.toLowerCase().includes(searchLower),
    );
  }

  if (role) {
    filteredUsers = filteredUsers.filter((u) => u.role === role);
  }

  const total = filteredUsers.length;
  const totalPages = Math.ceil(total / pageSize);
  const paginatedUsers = filteredUsers.slice(page * pageSize, (page + 1) * pageSize);

  return {
    data: paginatedUsers,
    meta: {
      total,
      page,
      pageSize,
      totalPages,
    },
    filterOptions: {
      roles: ["user", "admin"],
    },
  };
});
