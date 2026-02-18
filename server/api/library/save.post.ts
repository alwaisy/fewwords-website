import { eq } from "drizzle-orm";

import { savedSummaries, summaries } from "~~/db/schema";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const userId = (session.user as { id: string }).id;
  const { summaryId } = await readBody(event);

  if (!summaryId) {
    throw createError({
      statusCode: 400,
      statusMessage: "summaryId is required",
    });
  }

  const db = await useDb(event);

  // Check if summary exists
  const summary = await db
    .select({ id: summaries.id })
    .from(summaries)
    .where(eq(summaries.summaryId, summaryId))
    .limit(1);

  if (summary.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: "Summary not found",
    });
  }

  // Check if already saved
  const existing = await db
    .select()
    .from(savedSummaries)
    .where(eq(savedSummaries.userId, userId))
    .limit(1);

  const alreadySaved = existing.find((s) => s.summaryId === summaryId);

  if (alreadySaved) {
    return { success: true, message: "Already saved" };
  }

  // Save summary
  await db.insert(savedSummaries).values({
    userId,
    summaryId,
  });

  return { success: true, message: "Summary saved" };
});
