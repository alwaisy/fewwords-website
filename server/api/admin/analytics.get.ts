import { desc, sql } from "drizzle-orm";

import { summaries, users } from "~~/database/orm/schema";

export default defineEventHandler(async (event) => {
  const db = await useDb(event);

  // Group by utmSource for Summaries
  const summariesBySource = await db
    .select({
      source: sql<string>`COALESCE(${summaries.utmSource}, 'Direct/Unknown')`,
      count: sql<number>`count(*)::int`,
    })
    .from(summaries)
    .groupBy(sql`COALESCE(${summaries.utmSource}, 'Direct/Unknown')`)
    .orderBy(desc(sql`count(*)`));

  // Group by Country for Summaries
  const summariesByCountry = await db
    .select({
      country: sql<string>`COALESCE(${summaries.countryCode}, 'Unknown')`,
      count: sql<number>`count(*)::int`,
    })
    .from(summaries)
    .groupBy(sql`COALESCE(${summaries.countryCode}, 'Unknown')`)
    .orderBy(desc(sql`count(*)`));

  // Group by utmSource for Users
  const usersBySource = await db
    .select({
      source: sql<string>`COALESCE(${users.utmSource}, 'Direct/Unknown')`,
      count: sql<number>`count(*)::int`,
    })
    .from(users)
    .groupBy(sql`COALESCE(${users.utmSource}, 'Direct/Unknown')`)
    .orderBy(desc(sql`count(*)`));

  // Group by Country for Users
  const usersByCountry = await db
    .select({
      country: sql<string>`COALESCE(${users.countryCode}, 'Unknown')`,
      count: sql<number>`count(*)::int`,
    })
    .from(users)
    .groupBy(sql`COALESCE(${users.countryCode}, 'Unknown')`)
    .orderBy(desc(sql`count(*)`));

  return {
    summariesBySource,
    summariesByCountry,
    usersBySource,
    usersByCountry,
  };
});
