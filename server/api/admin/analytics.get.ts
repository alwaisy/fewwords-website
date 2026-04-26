import { desc, sql, gte } from "drizzle-orm";

import { summaries, users } from "~~/database/orm/schema";

export default defineEventHandler(async (event) => {
  const db = await useDb(event);

  // Date 30 days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 1. Summaries by Source (Top 10)
  const summariesBySource = await db
    .select({
      source: sql<string>`COALESCE(${summaries.utmSource}, 'Direct/Unknown')`,
      count: sql<number>`count(*)::int`,
    })
    .from(summaries)
    .groupBy(sql`COALESCE(${summaries.utmSource}, 'Direct/Unknown')`)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // 2. Users by Source (Top 10)
  const usersBySource = await db
    .select({
      source: sql<string>`COALESCE(${users.utmSource}, 'Direct/Unknown')`,
      count: sql<number>`count(*)::int`,
    })
    .from(users)
    .groupBy(sql`COALESCE(${users.utmSource}, 'Direct/Unknown')`)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // 3. Summaries by Country (Top 10)
  const summariesByCountry = await db
    .select({
      country: sql<string>`COALESCE(${summaries.countryCode}, 'Unknown')`,
      count: sql<number>`count(*)::int`,
    })
    .from(summaries)
    .groupBy(sql`COALESCE(${summaries.countryCode}, 'Unknown')`)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // 4. Summaries over Time (Last 30 days)
  const summariesOverTime = await db
    .select({
      date: sql<string>`date_trunc('day', ${summaries.createdAt})`,
      count: sql<number>`count(*)::int`,
    })
    .from(summaries)
    .where(gte(summaries.createdAt, thirtyDaysAgo))
    .groupBy(sql`date_trunc('day', ${summaries.createdAt})`)
    .orderBy(sql`date_trunc('day', ${summaries.createdAt})`);

  // 5. Users over Time (Last 30 days)
  const usersOverTime = await db
    .select({
      date: sql<string>`date_trunc('day', ${users.createdAt})`,
      count: sql<number>`count(*)::int`,
    })
    .from(users)
    .where(gte(users.createdAt, thirtyDaysAgo))
    .groupBy(sql`date_trunc('day', ${users.createdAt})`)
    .orderBy(sql`date_trunc('day', ${users.createdAt})`);

  // 6. Device Distribution (from metadata JSONB)
  // We can try to extract browser from userAgent if we had it as a column, 
  // but since it's in metadata JSONB now:
  const deviceDistribution = await db
    .select({
      device: sql<string>`COALESCE(${summaries.metadata}->>'deviceId', 'Unknown')`,
      count: sql<number>`count(*)::int`,
    })
    .from(summaries)
    .groupBy(sql`${summaries.metadata}->>'deviceId'`)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  return {
    summariesBySource,
    usersBySource,
    summariesByCountry,
    summariesOverTime: summariesOverTime.map(d => ({
      date: new Date(d.date).toISOString().split('T')[0],
      count: d.count
    })),
    usersOverTime: usersOverTime.map(d => ({
      date: new Date(d.date).toISOString().split('T')[0],
      count: d.count
    })),
    deviceDistribution
  };
});
