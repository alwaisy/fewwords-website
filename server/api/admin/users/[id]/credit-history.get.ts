import { eq, desc } from "drizzle-orm";

import { creditUsageLogs, summaries } from "~~/database/orm/schema";
import { useDb } from "~~/server/db";

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, "id");

  if (!userId) {
    throw createError({
      statusCode: 400,
      message: "User ID is required",
    });
  }

  const db = await useDb(event);

  const history = await db
    .select({
      id: creditUsageLogs.id,
      amount: creditUsageLogs.amount,
      action: creditUsageLogs.action,
      summaryId: creditUsageLogs.summaryId,
      createdAt: creditUsageLogs.createdAt,
      title: summaries.title,
    })
    .from(creditUsageLogs)
    .leftJoin(summaries, eq(creditUsageLogs.summaryId, summaries.summaryId))
    .where(eq(creditUsageLogs.userId, userId))
    .orderBy(desc(creditUsageLogs.createdAt))
    .limit(50);

  return {
    history,
  };
});