import { eq } from "drizzle-orm";

import { waitlist } from "~~/db/schema";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  const userId = session?.user
    ? (session.user as { id: string }).id
    : null;
  const userEmail = session?.user
    ? (session.user as { email: string }).email
    : null;

  const body = await readBody(event);
  const email = body?.email ?? userEmail;

  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email is required",
    });
  }

  const db = await useDb(event);

  // Check if already on waitlist
  const existing = await db
    .select({ id: waitlist.id })
    .from(waitlist)
    .where(eq(waitlist.email, email))
    .limit(1);

  if (existing.length > 0) {
    return {
      success: true,
      message: "You're already on the waitlist!",
      alreadyExists: true,
    };
  }

  await db.insert(waitlist).values({
    email,
    userId,
  });

  return {
    success: true,
    message: "You're on the waitlist. We'll notify you when paid plans launch.",
    alreadyExists: false,
  };
});
