import { eq, and, gt } from "drizzle-orm";

import { users } from "~~/database/orm/schema";

export default defineEventHandler(async (event) => {
  const token = getQuery(event).token as string;

  if (!token) {
    throw createError({
      statusCode: 400,
      statusMessage: "Verification token is required",
    });
  }

  const db = await useDb(event);

  // Find user with valid email change token
  const userRows = await db
    .select({
      id: users.id,
      pendingEmail: users.pendingEmail,
      name: users.name,
    })
    .from(users)
    .where(
      and(
        eq(users.emailChangeToken, token),
        gt(users.emailChangeExpiresAt, new Date())
      )
    )
    .limit(1);

  const user = userRows[0];

  if (!user) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid or expired verification link",
    });
  }

  if (!user.pendingEmail) {
    throw createError({
      statusCode: 400,
      statusMessage: "No pending email change found",
    });
  }

  // Update email and clear verification fields
  await db
    .update(users)
    .set({
      email: user.pendingEmail,
      pendingEmail: null,
      emailChangeToken: null,
      emailChangeExpiresAt: null,
    })
    .where(eq(users.id, user.id));

  console.log(`[User] Email verified for user ${user.id}: ${user.pendingEmail}`);

  // Return JSON response instead of redirect
  return {
    success: true,
    oldEmail: user.name,
    newEmail: user.pendingEmail,
    message: "Email verified successfully"
  };
});
