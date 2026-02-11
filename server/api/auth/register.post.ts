import { eq, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { Resend } from "resend";

import { users } from "~~/db/schema";

export default defineEventHandler(async (event) => {
  try {
    const { email, name, username } = await readBody(event);

    if (!email || !name || !username) {
      throw createError({
        statusCode: 400,
        statusMessage: "Email, name, and username are required",
      });
    }

    const db = await useDb(event);

    // Check if user already exists
    const existingUserRows = await db
      .select()
      .from(users)
      .where(or(eq(users.email, email), eq(users.username, username)));

    const existingUser = existingUserRows[0];

    if (existingUser) {
      if (existingUser.email === email) {
        return {
          success: false,
          exists: true,
          message: "An account with this email already exists",
        };
      }
      return {
        success: false,
        exists: true,
        message: "Username already taken",
      };
    }

    // Generate magic link token (valid for 15 minutes)
    const token = nanoid(32);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create user with magic link token
    await db.insert(users).values({
      email,
      name,
      username,
      magicLinkToken: token,
      magicLinkExpiresAt: expiresAt,
    });

    const baseUrl = process.env.NUXT_SITE_URL || getRequestURL(event).origin;
    const magicLink = `${baseUrl}/auth/verify?token=${token}`;

    // Send email with Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: `${process.env.RESEND_FROM_NAME || 'Fewwords'} <${process.env.RESEND_FROM_EMAIL || 'magiclink@m.fewwords.app'}>`,
        to: [email],
        subject: "Welcome to Fewwords!",
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to Fewwords, ${name}!</h2>
            <p style="color: #666; line-height: 1.6;">Click the button below to verify your email and sign in:</p>
            <a href="${magicLink}" style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Verify email</a>
            <p style="color: #999; font-size: 14px; margin-top: 24px;">This link expires in 15 minutes.</p>
            <p style="color: #999; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
          </div>
        `,
      });
    }

    return {
      success: true,
      exists: false,
      message: "Account created! Check your email for a magic link.",
    };
  } catch (error: unknown) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create account",
    });
  }
});
