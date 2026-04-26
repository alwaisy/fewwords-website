import { eq, desc } from "drizzle-orm";

import { creditUsageLogs, summaries } from "~~/database/orm/schema";
import { useDb } from "~~/server/db";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  const userId = session?.user ? (session.user as { id: string }).id : null;

  if (!userId) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }

  const db = await useDb(event);

  // Fetch the last 50 credit usage logs for the user, with summary title if available
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