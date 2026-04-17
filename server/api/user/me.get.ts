import { eq } from "drizzle-orm";

import { users } from "~~/database/orm/schema";

/**
 * GET /api/user/me
 * Returns fresh user data from the database and REFRESHES the session cookie.
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  const userId = session?.user ? (session.user as { id: string }).id : null;

  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const db = await useDb(event);
  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const user = userRows[0];
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  // Ensure types match User interface (username null -> undefined)
  const userData = {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username ?? undefined,
    role: user.role,
    plan: user.plan,
    creditsUsed: user.creditsUsed,
    creditsLimit: user.creditsLimit,
    periodResetAt: user.periodResetAt ? user.periodResetAt.toISOString() : null,
    createdAt: user.createdAt.toISOString(),
  };

  // IMPORTANT: Update the session cookie with the latest data from the DB
  await setUserSession(event, {
    ...session,
    user: userData
  });

  return {
    user: userData
  };
});
