import { count, eq, sql, desc } from "drizzle-orm";

import type { UserRole } from "~~/db/schema";
import { articles, summaries, users, youtube } from "~~/db/schema";

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
    summaryTokensResult,
    summaryReasoningTokensResult,
    youtubeClassifierTokensResult,
    articleClassifierTokensResult,
    completedSummariesResult,
    failedSummariesResult,
    thisMonthSummariesResult,
    lastMonthSummariesResult,
    thisMonthUsersResult,
    lastMonthUsersResult,
    thisMonthSummaryTokensResult,
    lastMonthSummaryTokensResult,
    essenceBreakdownResult,
    recentSummariesResult,
    // Average stats for articles
    articleStatsResult,
    // Average stats for youtube
    youtubeStatsResult,
    // Article min/max stats
    articleMinMaxResult,
    // YouTube min/max stats
    youtubeMinMaxResult,
    // Model stats for summaries
    summaryModelsResult,
    // Model stats for article classifiers
    articleClassifierModelsResult,
    // Model stats for youtube classifiers
    youtubeClassifierModelsResult,
  ] = await Promise.all([
    // Total counts
    db.select({ count: count() }).from(summaries),
    db.select({ count: count() }).from(users),

    // Holistic token counting: Summary tokens (main)
    db
      .select({ total: sql<number>`COALESCE(SUM(${summaries.totalTokens}), 0)` })
      .from(summaries)
      .where(isNotNull(summaries.totalTokens)),

    // Holistic token counting: Reasoning tokens from summaries
    db
      .select({ total: sql<number>`COALESCE(SUM(${summaries.reasoningTokens}), 0)` })
      .from(summaries)
      .where(isNotNull(summaries.reasoningTokens)),

    // Holistic token counting: YouTube classifier tokens
    db
      .select({ total: sql<number>`COALESCE(SUM(${youtube.classifierTotalTokens}), 0)` })
      .from(youtube)
      .where(isNotNull(youtube.classifierTotalTokens)),

    // Holistic token counting: Article classifier tokens
    db
      .select({ total: sql<number>`COALESCE(SUM(${articles.classifierTotalTokens}), 0)` })
      .from(articles)
      .where(isNotNull(articles.classifierTotalTokens)),

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

    // This month summary tokens (for comparison)
    db
      .select({ total: sql<number>`COALESCE(SUM(${summaries.totalTokens}), 0)` })
      .from(summaries)
      .where(
        sql`${summaries.createdAt} >= ${startOfMonthStr} AND ${summaries.totalTokens} IS NOT NULL`
      ),

    // Last month summary tokens (for comparison)
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

    // Article average stats: avg tokens (summary + classifier) and avg time
    db
      .select({
        count: count(),
        avgSummaryTokens: sql<number>`AVG(${summaries.totalTokens})`,
        avgReasoningTokens: sql<number>`AVG(${summaries.reasoningTokens})`,
        avgResponseTimeMs: sql<number>`AVG(${summaries.responseTimeMs})`,
      })
      .from(summaries)
      .leftJoin(articles, sql`${articles.summaryId} = ${summaries.id}`)
      .where(sql`${summaries.essence} = 'article' AND ${summaries.status} = 'completed'`),

    // YouTube average stats: avg tokens (summary + classifier) and avg time
    db
      .select({
        count: count(),
        avgSummaryTokens: sql<number>`AVG(${summaries.totalTokens})`,
        avgReasoningTokens: sql<number>`AVG(${summaries.reasoningTokens})`,
        avgResponseTimeMs: sql<number>`AVG(${summaries.responseTimeMs})`,
      })
      .from(summaries)
      .leftJoin(youtube, sql`${youtube.summaryId} = ${summaries.id}`)
      .where(sql`${summaries.essence} = 'youtube' AND ${summaries.status} = 'completed'`),

    // Article min/max stats
    db
      .select({
        minSummaryTokens: sql<number>`MIN(${summaries.totalTokens})`,
        maxSummaryTokens: sql<number>`MAX(${summaries.totalTokens})`,
        minResponseTimeMs: sql<number>`MIN(${summaries.responseTimeMs})`,
        maxResponseTimeMs: sql<number>`MAX(${summaries.responseTimeMs})`,
      })
      .from(summaries)
      .where(sql`${summaries.essence} = 'article' AND ${summaries.status} = 'completed' AND ${summaries.totalTokens} IS NOT NULL`),

    // YouTube min/max stats
    db
      .select({
        minSummaryTokens: sql<number>`MIN(${summaries.totalTokens})`,
        maxSummaryTokens: sql<number>`MAX(${summaries.totalTokens})`,
        minResponseTimeMs: sql<number>`MIN(${summaries.responseTimeMs})`,
        maxResponseTimeMs: sql<number>`MAX(${summaries.responseTimeMs})`,
      })
      .from(summaries)
      .where(sql`${summaries.essence} = 'youtube' AND ${summaries.status} = 'completed' AND ${summaries.totalTokens} IS NOT NULL`),

    // Model stats: Summary models (from summaries table)
    db
      .select({
        model: summaries.model,
        count: count(),
      })
      .from(summaries)
      .where(isNotNull(summaries.model))
      .groupBy(summaries.model)
      .orderBy(desc(count())),

    // Model stats: Article classifier models
    db
      .select({
        model: articles.classifierModel,
        count: count(),
      })
      .from(articles)
      .innerJoin(summaries, sql`${articles.summaryId} = ${summaries.id}`)
      .where(isNotNull(articles.classifierModel))
      .groupBy(articles.classifierModel)
      .orderBy(desc(count())),

    // Model stats: YouTube classifier models
    db
      .select({
        model: youtube.classifierModel,
        count: count(),
      })
      .from(youtube)
      .innerJoin(summaries, sql`${youtube.summaryId} = ${summaries.id}`)
      .where(isNotNull(youtube.classifierModel))
      .groupBy(youtube.classifierModel)
      .orderBy(desc(count())),
  ]);

  // Get classifier token averages separately (need to join with youtube/articles tables)
  const articleClassifierAvg = await db
    .select({
      avgClassifierTokens: sql<number>`AVG(${articles.classifierTotalTokens})`,
      avgClassifierTimeMs: sql<number>`AVG(${articles.classifierTimeMs})`,
    })
    .from(articles)
    .innerJoin(summaries, sql`${articles.summaryId} = ${summaries.id}`)
    .where(sql`${summaries.status} = 'completed'`);

  const youtubeClassifierAvg = await db
    .select({
      avgClassifierTokens: sql<number>`AVG(${youtube.classifierTotalTokens})`,
      avgClassifierTimeMs: sql<number>`AVG(${youtube.classifierTimeMs})`,
    })
    .from(youtube)
    .innerJoin(summaries, sql`${youtube.summaryId} = ${summaries.id}`)
    .where(sql`${summaries.status} = 'completed'`);

  // Extract values
  const totalSummaries = totalSummariesResult[0]?.count ?? 0;
  const totalUsers = totalUsersResult[0]?.count ?? 0;

  // Holistic token counting: sum all token sources
  const summaryTokens = Number(summaryTokensResult[0]?.total ?? 0);
  const summaryReasoningTokens = Number(summaryReasoningTokensResult[0]?.total ?? 0);
  const youtubeClassifierTokens = Number(youtubeClassifierTokensResult[0]?.total ?? 0);
  const articleClassifierTokens = Number(articleClassifierTokensResult[0]?.total ?? 0);

  // Total holistic tokens
  const totalHolisticTokens = summaryTokens + summaryReasoningTokens + youtubeClassifierTokens + articleClassifierTokens;

  const completedSummaries = completedSummariesResult[0]?.count ?? 0;
  const failedSummaries = failedSummariesResult[0]?.count ?? 0;

  const thisMonthSummaries = thisMonthSummariesResult[0]?.count ?? 0;
  const lastMonthSummaries = lastMonthSummariesResult[0]?.count ?? 0;
  const thisMonthUsers = thisMonthUsersResult[0]?.count ?? 0;
  const lastMonthUsers = lastMonthUsersResult[0]?.count ?? 0;
  const thisMonthTokens = Number(thisMonthSummaryTokensResult[0]?.total ?? 0);
  const lastMonthTokens = Number(lastMonthSummaryTokensResult[0]?.total ?? 0);

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

  // Calculate average stats for articles
  const articleCount = articleStatsResult[0]?.count ?? 0;
  const articleAvgSummaryTokens = Number(articleStatsResult[0]?.avgSummaryTokens ?? 0);
  const articleAvgReasoningTokens = Number(articleStatsResult[0]?.avgReasoningTokens ?? 0);
  const articleAvgClassifierTokens = Number(articleClassifierAvg[0]?.avgClassifierTokens ?? 0);
  const articleAvgTotalTokens = articleAvgSummaryTokens + articleAvgReasoningTokens + articleAvgClassifierTokens;
  const articleAvgResponseTimeMs = Number(articleStatsResult[0]?.avgResponseTimeMs ?? 0);
  const articleAvgClassifierTimeMs = Number(articleClassifierAvg[0]?.avgClassifierTimeMs ?? 0);
  const articleAvgTotalTimeMs = articleAvgResponseTimeMs + articleAvgClassifierTimeMs;

  // Calculate average stats for YouTube
  const youtubeCount = youtubeStatsResult[0]?.count ?? 0;
  const youtubeAvgSummaryTokens = Number(youtubeStatsResult[0]?.avgSummaryTokens ?? 0);
  const youtubeAvgReasoningTokens = Number(youtubeStatsResult[0]?.avgReasoningTokens ?? 0);
  const youtubeAvgClassifierTokens = Number(youtubeClassifierAvg[0]?.avgClassifierTokens ?? 0);
  const youtubeAvgTotalTokens = youtubeAvgSummaryTokens + youtubeAvgReasoningTokens + youtubeAvgClassifierTokens;
  const youtubeAvgResponseTimeMs = Number(youtubeStatsResult[0]?.avgResponseTimeMs ?? 0);
  const youtubeAvgClassifierTimeMs = Number(youtubeClassifierAvg[0]?.avgClassifierTimeMs ?? 0);
  const youtubeAvgTotalTimeMs = youtubeAvgResponseTimeMs + youtubeAvgClassifierTimeMs;

  // Extract min/max stats
  const articleMinTokens = Number(articleMinMaxResult[0]?.minSummaryTokens ?? 0);
  const articleMaxTokens = Number(articleMinMaxResult[0]?.maxSummaryTokens ?? 0);
  const articleMinTimeMs = Number(articleMinMaxResult[0]?.minResponseTimeMs ?? 0);
  const articleMaxTimeMs = Number(articleMinMaxResult[0]?.maxResponseTimeMs ?? 0);

  const youtubeMinTokens = Number(youtubeMinMaxResult[0]?.minSummaryTokens ?? 0);
  const youtubeMaxTokens = Number(youtubeMinMaxResult[0]?.maxSummaryTokens ?? 0);
  const youtubeMinTimeMs = Number(youtubeMinMaxResult[0]?.minResponseTimeMs ?? 0);
  const youtubeMaxTimeMs = Number(youtubeMinMaxResult[0]?.maxResponseTimeMs ?? 0);

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
        value: formatTokens(totalHolisticTokens),
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
    // Average stats by content type
    avgStats: {
      article: {
        count: articleCount,
        avgTokens: Math.round(articleAvgTotalTokens),
        avgTimeMs: Math.round(articleAvgTotalTimeMs),
        minTokens: articleMinTokens,
        maxTokens: articleMaxTokens,
        minTimeMs: articleMinTimeMs,
        maxTimeMs: articleMaxTimeMs,
        breakdown: {
          summaryTokens: Math.round(articleAvgSummaryTokens),
          reasoningTokens: Math.round(articleAvgReasoningTokens),
          classifierTokens: Math.round(articleAvgClassifierTokens),
          summaryTimeMs: Math.round(articleAvgResponseTimeMs),
          classifierTimeMs: Math.round(articleAvgClassifierTimeMs),
        },
      },
      youtube: {
        count: youtubeCount,
        avgTokens: Math.round(youtubeAvgTotalTokens),
        avgTimeMs: Math.round(youtubeAvgTotalTimeMs),
        minTokens: youtubeMinTokens,
        maxTokens: youtubeMaxTokens,
        minTimeMs: youtubeMinTimeMs,
        maxTimeMs: youtubeMaxTimeMs,
        breakdown: {
          summaryTokens: Math.round(youtubeAvgSummaryTokens),
          reasoningTokens: Math.round(youtubeAvgReasoningTokens),
          classifierTokens: Math.round(youtubeAvgClassifierTokens),
          summaryTimeMs: Math.round(youtubeAvgResponseTimeMs),
          classifierTimeMs: Math.round(youtubeAvgClassifierTimeMs),
        },
      },
    },
    total: {
      summaries: totalSummaries,
      users: totalUsers,
      tokens: totalHolisticTokens,
      tokenBreakdown: {
        summaryTokens,
        reasoningTokens: summaryReasoningTokens,
        youtubeClassifierTokens,
        articleClassifierTokens,
      },
    },
    modelStats: {
      summaryModels: summaryModelsResult.map(m => ({
        model: m.model,
        count: m.count,
      })),
      articleClassifierModels: articleClassifierModelsResult.map(m => ({
        model: m.model,
        count: m.count,
      })),
      youtubeClassifierModels: youtubeClassifierModelsResult.map(m => ({
        model: m.model,
        count: m.count,
      })),
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
