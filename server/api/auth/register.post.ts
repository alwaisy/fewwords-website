import { eq } from "drizzle-orm";
import { Resend } from "resend";

import { getSender } from "../../config/emails";
import { otpEmail } from "../../templates/emails";

import { users } from "~~/database/orm/schema";

// Generate 6-digit OTP code
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

    // Email exists but not verified - resend OTP
    if (existingEmailUser && !existingEmailUser.emailVerified) {
      const otpCode = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Update username only if they provided a different one
      const updateData: {
        otpCode: string;
        otpExpiresAt: Date;
        name?: string;
        username?: string;
      } = {
        otpCode,
        otpExpiresAt: expiresAt,
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
      const resendApiKey = config.private.resendApiKey;
      if (resendApiKey) {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: getSender("auth"),
          to: [email],
          subject: `Your code: ${otpCode}`,
          html: otpEmail({
            greeting: `Welcome to Fewwords, ${name}!`,
            message: "Enter this code to verify your email and sign in:",
            otpCode,
          }),
        });
      }

      return {
        success: true,
        exists: false,
        message: "Account created! Check your email for a verification code.",
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

    // Generate OTP code (valid for 10 minutes)
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user with OTP code
    await db.insert(users).values({
      email,
      name,
      username,
      otpCode,
      otpExpiresAt: expiresAt,
    });

    const config = useRuntimeConfig();
    const resendApiKey = config.private.resendApiKey;
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: getSender("auth"),
        to: [email],
        subject: `Your code: ${otpCode}`,
        html: otpEmail({
          greeting: `Welcome to Fewwords, ${name}!`,
          message: "Enter this code to verify your email and sign in:",
          otpCode,
        }),
      });
    }

    return {
      success: true,
      exists: false,
      message: "Account created! Check your email for a verification code.",
    };
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create account",
    });
  }
});
