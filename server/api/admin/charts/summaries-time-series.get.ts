import { sql } from "drizzle-orm";

import type { UserRole } from "~~/database/orm/schema";
import { summaries } from "~~/database/orm/schema";

/**
 * Admin-only endpoint to get summaries time series data for charts
 * Returns daily summary counts for the last 30 days
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

  // Get date range - last 30 days - convert to ISO string for raw SQL
  const now = new Date();
  const daysBack = 30;
  const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  const startDateStr = startDate.toISOString();

  // Query daily summary counts
  const dailyCounts = await db
    .execute(
      sql`
        SELECT
          DATE_TRUNC('day', ${summaries.createdAt}) as date,
          COUNT(*) as count,
          SUM(CASE WHEN ${summaries.essence} = 'article' THEN 1 ELSE 0 END) as articles,
          SUM(CASE WHEN ${summaries.essence} = 'youtube' THEN 1 ELSE 0 END) as youtube,
          SUM(CASE WHEN ${summaries.essence} = 'reddit' THEN 1 ELSE 0 END) as reddit,
          SUM(CASE WHEN ${summaries.status} = 'failed' THEN 1 ELSE 0 END) as failed
        FROM ${summaries}
        WHERE ${summaries.createdAt} >= ${startDateStr}
        GROUP BY DATE_TRUNC('day', ${summaries.createdAt})
        ORDER BY date ASC
      `
    );

  // Convert to chart data format - return Date objects for Unovis
  const chartData = dailyCounts.map((row: unknown) => {
    const r = row as Record<string, unknown>;
    return {
      date: new Date(r.date as string), // Return Date object, not string
      total: Number(r.count),
      articles: Number(r.articles),
      youtube: Number(r.youtube),
      reddit: Number(r.reddit),
      failed: Number(r.failed),
    };
  });

  // Calculate totals by essence
  const totals = await db
    .execute(
      sql`
        SELECT
          ${summaries.essence},
          COUNT(*) as count
        FROM ${summaries}
        GROUP BY ${summaries.essence}
      `
    );

  const essenceBreakdown = totals.map((row: unknown) => {
    const r = row as Record<string, unknown>;
    return {
      essence: r.essence as string,
      count: parseInt(r.count as string),
    };
  });

  return {
    chartData,
    essenceBreakdown,
  };
});
