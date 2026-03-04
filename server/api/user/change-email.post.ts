import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { Resend } from "resend";

import { getSender } from "../../config/emails";
import { users } from "~~/db/schema";

interface ChangeEmailRequest {
  newEmail: string;
}

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const userId = (session.user as { id: string }).id;
  const userName = (session.user as { name?: string }).name || "there";

  const { newEmail } = await readBody<ChangeEmailRequest>(event);

  if (!newEmail || !newEmail.includes("@")) {
    throw createError({
      statusCode: 400,
      statusMessage: "Valid email is required",
    });
  }

  const db = await useDb(event);

  // Check if email is already taken
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, newEmail))
    .limit(1);

  if (existing.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email already in use",
    });
  }

  // Generate verification token (valid for 15 minutes)
  const token = nanoid(32);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  // Store pending email change with token
  await db
    .update(users)
    .set({
      pendingEmail: newEmail,
      emailChangeToken: token,
      emailChangeExpiresAt: expiresAt,
    })
    .where(eq(users.id, userId));

  // Send verification email to NEW email address
  const config = useRuntimeConfig();
  const baseUrl = config.public.siteUrl || getRequestURL(event).origin;
  const verifyLink = `${baseUrl}/settings?token=${token}&verifyEmail=true`;

  const resendApiKey = config.private.resendApiKey;
  if (resendApiKey) {
    const resend = new Resend(resendApiKey);
    await resend.emails.send({
      from: getSender("auth"),
      to: [newEmail],
      subject: "Confirm your new email",
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Hey ${userName}!</h2>
          <p style="color: #666; line-height: 1.6;">You requested to change your email address. Click the button below to confirm:</p>
          <a href="${verifyLink}" style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Confirm email change</a>
          <p style="color: #999; font-size: 14px; margin-top: 24px;">This link expires in 15 minutes.</p>
          <p style="color: #999; font-size: 14px;">If you didn't request this change, you can safely ignore this email.</p>
        </div>
      `,
    });
  }

  console.log(`[User] Email change requested for user ${userId} to ${newEmail}`);

  return {
    success: true,
    message: "Verification email sent! Check your new email address.",
  };
});
