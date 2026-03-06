import { eq, and, gt } from "drizzle-orm";

import { users } from "~~/db/schema";

export default defineEventHandler(async (event) => {
  try {
    const { code } = await readBody(event);

    if (!code) {
      throw createError({
        statusCode: 400,
        statusMessage: "Verification code is required",
      });
    }

    const db = await useDb(event);

    // Find user with valid OTP code
    const userRows = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.otpCode, code),
          gt(users.otpExpiresAt, new Date())
        )
      );

    const user = userRows[0];

    if (!user) {
      return {
        success: false,
        message: "Invalid or expired code",
      };
    }

    // Clear OTP code and mark email as verified
    await db
      .update(users)
      .set({
        otpCode: null,
        otpExpiresAt: null,
        emailVerified: true,
      })
      .where(eq(users.id, user.id));

    // Set user session
    const sessionData = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username ?? undefined,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
    };

    await setUserSession(event, sessionData);

    return {
      success: true,
      message: "Successfully verified!",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
    };
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to verify code",
    });
  }
});
