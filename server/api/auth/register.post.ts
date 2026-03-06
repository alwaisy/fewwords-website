import { eq } from "drizzle-orm";
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

    // STEP 1: Check if email already exists (ALWAYS check email first)
    const existingEmailRows = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    const existingEmailUser = existingEmailRows[0];

    // Email exists but not verified - resend magic link
    if (existingEmailUser && !existingEmailUser.emailVerified) {
      const token = nanoid(32);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      // Update username only if they provided a different one
      const updateData: {
        magicLinkToken: string;
        magicLinkExpiresAt: Date;
        name?: string;
        username?: string;
      } = {
        magicLinkToken: token,
        magicLinkExpiresAt: expiresAt,
      };

      // Only update name if provided
      if (name && name !== existingEmailUser.name) {
        updateData.name = name;
      }

      // Only update username if provided and different from old one
      if (username && username !== existingEmailUser.username) {
        updateData.username = username;
      }

      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, existingEmailUser.id));

      const config = useRuntimeConfig();
      const baseUrl = config.public.siteUrl || getRequestURL(event).origin;
      const magicLink = `${baseUrl}/auth/verify?token=${token}`;

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
    }

    // Email exists and verified - block
    if (existingEmailUser && existingEmailUser.emailVerified) {
      return {
        success: false,
        exists: true,
        message: "An account with this email already exists",
      };
    }

    // STEP 2: Check if username is taken by someone else
    const usernameTaken = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (usernameTaken.length > 0) {
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
