import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { Resend } from "resend";
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

    const baseUrl = process.env.NUXT_SITE_URL || getRequestURL(event).origin;
    const magicLink = `${baseUrl}/auth/verify?token=${token}`;

    // Send email with Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: `${process.env.RESEND_FROM_NAME || 'Fewwords'} <${process.env.RESEND_FROM_EMAIL || 'magiclink@m.fewwords.app'}>`,
        to: [email],
        subject: "Your magic link is here",
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Hey ${user.name}!</h2>
            <p style="color: #666; line-height: 1.6;">Click the button below to sign in to Fewwords:</p>
            <a href="${magicLink}" style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Sign in</a>
            <p style="color: #999; font-size: 14px; margin-top: 24px;">This link expires in 15 minutes.</p>
            <p style="color: #999; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });
    } else {
      // Fallback to console if no API key
      console.log(`Magic link for ${email}: ${magicLink}`);
    }

    return {
      success: true,
      exists: true,
      message: "Magic link sent! Check your email.",
    };
  } catch (error: unknown) {
    console.error("Login error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to send magic link",
    });
  }
});
