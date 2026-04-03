import { eq } from "drizzle-orm";

import { users } from "~~/database/orm/schema";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const userId = (session.user as { id: string }).id;

  const db = await useDb(event);

  // Delete user account
  // Summaries are NOT deleted (they're our property)
  // Just remove user record
  await db.delete(users).where(eq(users.id, userId));

  console.log(`[User] Account deleted for user ${userId}`);

  // Clear session
  await clearUserSession(event);

  return {
    success: true,
    message: "Account deleted successfully",
  };
});
