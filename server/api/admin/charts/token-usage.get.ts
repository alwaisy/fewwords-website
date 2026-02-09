import { sql } from "drizzle-orm";

import type { UserRole } from "~~/db/schema";
import { summaries } from "~~/db/schema";

/**
 * Admin-only endpoint to get token usage data for charts
 * Returns daily token usage and provider breakdown
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

  // Query daily token usage
  const dailyUsage = await db
    .execute(
      sql`
        SELECT
          DATE_TRUNC('day', ${summaries.createdAt}) as date,
          COALESCE(SUM(${summaries.totalTokens}), 0) as tokens,
          COALESCE(SUM(${summaries.promptTokens}), 0) as prompt_tokens,
          COALESCE(SUM(${summaries.completionTokens}), 0) as completion_tokens,
          COALESCE(SUM(${summaries.reasoningTokens}), 0) as reasoning_tokens
        FROM ${summaries}
        WHERE ${summaries.createdAt} >= ${startDateStr}
          AND ${summaries.totalTokens} IS NOT NULL
        GROUP BY DATE_TRUNC('day', ${summaries.createdAt})
        ORDER BY date ASC
      `
    );

  // Convert to chart data format
  const chartData = dailyUsage.map((row: unknown) => {
    const r = row as Record<string, unknown>;
    return {
      date: new Date(r.date as string).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      total: parseInt(r.tokens as string),
      prompt: parseInt(r.prompt_tokens as string),
      completion: parseInt(r.completion_tokens as string),
      reasoning: parseInt(r.reasoning_tokens as string),
    };
  });

  // Get token usage by essence type
  const byEssence = await db
    .execute(
      sql`
        SELECT
          ${summaries.essence},
          COALESCE(SUM(${summaries.totalTokens}), 0) as tokens,
          COUNT(*) as count
        FROM ${summaries}
        WHERE ${summaries.totalTokens} IS NOT NULL
        GROUP BY ${summaries.essence}
      `
    );

  const essenceUsage = byEssence.map((row: unknown) => {
    const r = row as Record<string, unknown>;
    return {
      essence: r.essence as string,
      tokens: parseInt(r.tokens as string),
      count: parseInt(r.count as string),
    };
  });

  return {
    chartData,
    essenceUsage,
  };
});
