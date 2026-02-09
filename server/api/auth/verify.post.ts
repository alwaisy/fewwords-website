import { eq, and, gt } from "drizzle-orm";

import { users } from "~~/db/schema";

export default defineEventHandler(async (event) => {
  try {
    const { token } = await readBody(event);

    if (!token) {
      throw createError({
        statusCode: 400,
        statusMessage: "Token is required",
      });
    }

    const db = await useDb(event);

    // Find user with valid magic link token
    const userRows = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.magicLinkToken, token),
          gt(users.magicLinkExpiresAt, new Date())
        )
      );

    const user = userRows[0];

    if (!user) {
      return {
        success: false,
        message: "Invalid or expired magic link",
      };
    }

    // Clear magic link token
    await db
      .update(users)
      .set({
        magicLinkToken: null,
        magicLinkExpiresAt: null,
      })
      .where(eq(users.id, user.id));

    // Set user session
    await setUserSession(event, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        createdAt: user.createdAt.toISOString(),
      },
    });

    return {
      success: true,
      message: "Successfully verified!",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        createdAt: user.createdAt.toISOString(),
      },
    };
  } catch (error: unknown) {
    console.error("Verify error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Verification failed",
    });
  }
});
