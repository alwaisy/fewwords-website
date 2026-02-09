import { count, eq, sql, desc } from "drizzle-orm";

import type { UserRole } from "~~/db/schema";
import { summaries, users } from "~~/db/schema";

/**
 * Admin-only endpoint to get dashboard statistics
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

  const db = await useDb(event);

  // Calculate date ranges - keep as Date objects for Drizzle's SQL builder
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Convert to ISO strings for raw SQL comparisons
  const startOfMonthStr = startOfMonth.toISOString();
  const startOfLastMonthStr = startOfLastMonth.toISOString();
  const endOfLastMonthStr = endOfLastMonth.toISOString();

  // Run all queries in parallel for better performance
  const [
    totalSummariesResult,
    totalUsersResult,
    totalTokensResult,
    completedSummariesResult,
    failedSummariesResult,
    thisMonthSummariesResult,
    lastMonthSummariesResult,
    thisMonthUsersResult,
    lastMonthUsersResult,
    thisMonthTokensResult,
    lastMonthTokensResult,
    essenceBreakdownResult,
    recentSummariesResult,
  ] = await Promise.all([
    // Total counts
    db.select({ count: count() }).from(summaries),
    db.select({ count: count() }).from(users),
    db
      .select({ total: sql<number>`COALESCE(SUM(${summaries.totalTokens}), 0)` })
      .from(summaries)
      .where(isNotNull(summaries.totalTokens)),

    // Status breakdown
    db.select({ count: count() }).from(summaries).where(eq(summaries.status, "completed")),
    db.select({ count: count() }).from(summaries).where(eq(summaries.status, "failed")),

    // This month summaries
    db
      .select({ count: count() })
      .from(summaries)
      .where(sql`${summaries.createdAt} >= ${startOfMonthStr}`),

    // Last month summaries
    db
      .select({ count: count() })
      .from(summaries)
      .where(
        sql`${summaries.createdAt} >= ${startOfLastMonthStr} AND ${summaries.createdAt} < ${endOfLastMonthStr}`
      ),

    // This month users
    db.select({ count: count() }).from(users).where(sql`${users.createdAt} >= ${startOfMonthStr}`),

    // Last month users
    db
      .select({ count: count() })
      .from(users)
      .where(
        sql`${users.createdAt} >= ${startOfLastMonthStr} AND ${users.createdAt} < ${endOfLastMonthStr}`
      ),

    // This month tokens
    db
      .select({ total: sql<number>`COALESCE(SUM(${summaries.totalTokens}), 0)` })
      .from(summaries)
      .where(
        sql`${summaries.createdAt} >= ${startOfMonthStr} AND ${summaries.totalTokens} IS NOT NULL`
      ),

    // Last month tokens
    db
      .select({ total: sql<number>`COALESCE(SUM(${summaries.totalTokens}), 0)` })
      .from(summaries)
      .where(
        sql`${summaries.createdAt} >= ${startOfLastMonthStr} AND ${summaries.createdAt} < ${endOfLastMonthStr} AND ${summaries.totalTokens} IS NOT NULL`
      ),

    // Essence breakdown
    db
      .select({
        essence: summaries.essence,
        count: count(),
      })
      .from(summaries)
      .groupBy(summaries.essence),

    // Recent summaries
    db
      .select({
        summaryId: summaries.summaryId,
        title: summaries.title,
        essence: summaries.essence,
        status: summaries.status,
        createdAt: summaries.createdAt,
      })
      .from(summaries)
      .orderBy(desc(summaries.createdAt))
      .limit(10),
  ]);

  // Extract values
  const totalSummaries = totalSummariesResult[0]?.count ?? 0;
  const totalUsers = totalUsersResult[0]?.count ?? 0;
  const totalTokens = totalTokensResult[0]?.total ?? 0;
  const completedSummaries = completedSummariesResult[0]?.count ?? 0;
  const failedSummaries = failedSummariesResult[0]?.count ?? 0;

  const thisMonthSummaries = thisMonthSummariesResult[0]?.count ?? 0;
  const lastMonthSummaries = lastMonthSummariesResult[0]?.count ?? 0;
  const thisMonthUsers = thisMonthUsersResult[0]?.count ?? 0;
  const lastMonthUsers = lastMonthUsersResult[0]?.count ?? 0;
  const thisMonthTokens = thisMonthTokensResult[0]?.total ?? 0;
  const lastMonthTokens = lastMonthTokensResult[0]?.total ?? 0;

  // Calculate percentage changes
  const calculatePercentChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
  };

  // Success rate
  const totalProcessed = completedSummaries + failedSummaries;
  const successRate = totalProcessed > 0
    ? ((completedSummaries / totalProcessed) * 100).toFixed(1)
    : "100.0";

  // Format recent summaries
  const recentSummaries = recentSummariesResult.map((s) => ({
    id: s.summaryId,
    title: s.title ?? "Untitled",
    essence: s.essence,
    status: s.status,
    createdAt: formatRelativeTime(s.createdAt),
  }));

  // Essence breakdown with percentages
  const essenceStats = essenceBreakdownResult.map((e) => ({
    essence: e.essence,
    count: e.count,
    percentage: totalSummaries > 0
      ? ((e.count / totalSummaries) * 100).toFixed(1)
      : "0.0",
  }));

  return {
    statsCards: [
      {
        title: "Total Summaries",
        value: totalSummaries.toLocaleString(),
        change: calculatePercentChange(thisMonthSummaries, lastMonthSummaries) + " from last month",
        trend: thisMonthSummaries >= lastMonthSummaries ? "up" : "down",
      },
      {
        title: "Total Users",
        value: totalUsers.toLocaleString(),
        change: calculatePercentChange(thisMonthUsers, lastMonthUsers) + " from last month",
        trend: thisMonthUsers >= lastMonthUsers ? "up" : "down",
      },
      {
        title: "Token Usage",
        value: formatTokens(totalTokens),
        change: calculatePercentChange(thisMonthTokens, lastMonthTokens) + " from last month",
        trend: thisMonthTokens >= lastMonthTokens ? "up" : "down",
      },
      {
        title: "Success Rate",
        value: successRate + "%",
        change: "Overall completion rate",
        trend: "neutral",
      },
    ],
    essenceStats,
    recentSummaries,
    total: {
      summaries: totalSummaries,
      users: totalUsers,
      tokens: totalTokens,
    },
  };
});

/**
 * Format token count to human readable (e.g., 1.2M, 45.3K)
 */
function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) {
    return (tokens / 1_000_000).toFixed(1) + "M";
  }
  if (tokens >= 1_000) {
    return (tokens / 1_000).toFixed(1) + "K";
  }
  return tokens.toString();
}

/**
 * Format date as relative time (e.g., "2 minutes ago", "3 hours ago")
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

function isNotNull(value: unknown) {
  return sql`${value} IS NOT NULL`;
}
