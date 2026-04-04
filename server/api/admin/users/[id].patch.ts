import { eq } from "drizzle-orm";

import type { UserRole } from "~~/database/orm/schema";
import { users } from "~~/database/orm/schema";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (!session?.user || (session.user as { role?: UserRole }).role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Admin access required",
    });
  }

  const userId = getRouterParam(event, "id");
  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "User ID is required",
    });
  }

  const body = await readBody(event);
  const db = await useDb(event);

  const updateFields: Record<string, unknown> = {};

  if (typeof body.wordsUsed === "number") {
    updateFields.wordsUsed = body.wordsUsed;
  }

  if (typeof body.wordsLimit === "number") {
    updateFields.wordsLimit = body.wordsLimit;
  }

  if (Object.keys(updateFields).length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "No valid fields to update",
    });
  }

  await db
    .update(users)
    .set(updateFields)
    .where(eq(users.id, userId));

  return { success: true };
});