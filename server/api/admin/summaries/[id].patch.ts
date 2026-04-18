import { eq } from "drizzle-orm";

import type { UserRole } from "~~/database/orm/schema";
import { summaries } from "~~/database/orm/schema";

export default defineEventHandler(async (event) => {
  // 1. Verify admin role
  const session = await getUserSession(event);
  if (!session?.user || (session.user as { role?: UserRole }).role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Admin access required",
    });
  }

  // 2. Get ID and Body
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Summary ID is required",
    });
  }

  const db = await useDb(event);

  // 3. Update summary
  const updateData: Partial<typeof summaries.$inferInsert> = {};
  if (typeof body.isHidden === "boolean") {
    updateData.isHidden = body.isHidden;
  }
  
  if (typeof body.isPublic === "boolean") {
    updateData.isPublic = body.isPublic;
  }
  
  if (typeof body.isBlocked === "boolean") {
    updateData.isBlocked = body.isBlocked;
  }
  
  if (typeof body.blockReason === "string" || body.blockReason === null) {
    updateData.blockReason = body.blockReason;
  }

  if (Object.keys(updateData).length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "No valid fields to update",
    });
  }

  const result = await db
    .update(summaries)
    .set(updateData)
    .where(eq(summaries.id, id))
    .returning();

  if (!result || result.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: "Summary not found",
    });
  }

  return {
    success: true,
    data: result[0],
  };
});
