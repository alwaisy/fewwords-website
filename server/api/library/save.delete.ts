import { eq, and } from "drizzle-orm";

import { savedSummaries } from "~~/database/orm/schema";

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

  await db
    .delete(savedSummaries)
    .where(and(eq(savedSummaries.userId, userId), eq(savedSummaries.summaryId, summaryId)));

  return { success: true, message: "Summary unsaved" };
});
