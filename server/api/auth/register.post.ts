import { eq, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { Resend } from "resend";

import { getSender } from "../../config/emails";
import { authEmail } from "../../templates/emails";

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

    const config = useRuntimeConfig();
    const baseUrl = config.public.siteUrl || getRequestURL(event).origin;
    const magicLink = `${baseUrl}/auth/verify?token=${token}`;

    // Send email with Resend
    const resendApiKey = config.private.resendApiKey;
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: getSender("auth"),
        to: [email],
        subject: "Welcome to Fewwords!",
        html: authEmail({
          greeting: `Welcome to Fewwords, ${name}!`,
          message: "Click the button below to verify your email and sign in:",
          buttonText: "Verify email",
          buttonUrl: magicLink,
        }),
      });
    }

    return {
      success: true,
      exists: false,
      message: "Account created! Check your email for a magic link.",
    };
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create account",
    });
  }
});
