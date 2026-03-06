import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { Resend } from "resend";

import { getSender } from "../../config/emails";
import { authEmail } from "../../templates/emails";

import { users } from "~~/db/schema";

export default defineEventHandler(async (event) => {
  try {
    const { email } = await readBody(event);

    if (!email) {
      throw createError({
        statusCode: 400,
        statusMessage: "Email is required",
      });
    }

    const db = await useDb(event);

    // Find user by email
    const userRows = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        username: users.username,
      })
      .from(users)
      .where(eq(users.email, email));

    const user = userRows[0];

    if (!user) {
      return {
        success: true,
        exists: false,
        message: "If an account exists, a magic link has been sent to your email.",
      };
    }

    // Generate magic link token (valid for 15 minutes)
    const token = nanoid(32);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update user with magic link token
    await db
      .update(users)
      .set({
        magicLinkToken: token,
        magicLinkExpiresAt: expiresAt,
      })
      .where(eq(users.id, user.id));

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
        subject: "Your magic link is here",
        html: authEmail({
          greeting: `Hey ${user.name}!`,
          message: "Click the button below to sign in to Fewwords:",
          buttonText: "Sign in",
          buttonUrl: magicLink,
        }),
      });
    }

    return {
      success: true,
      exists: true,
      message: "Magic link sent! Check your email.",
    };
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to send magic link",
    });
  }
});
