import { eq } from "drizzle-orm";
import { Resend } from "resend";

import { getSender } from "../../config/emails";
import { otpEmail } from "../../templates/emails";

import { users } from "~~/db/schema";

// Generate 6-digit OTP code
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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
        message: "If an account exists, a verification code has been sent to your email.",
      };
    }

    // Generate OTP code (valid for 10 minutes)
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with OTP code
    await db
      .update(users)
      .set({
        otpCode,
        otpExpiresAt: expiresAt,
      })
      .where(eq(users.id, user.id));

    const config = useRuntimeConfig();
    const resendApiKey = config.private.resendApiKey;
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: getSender("auth"),
        to: [email],
        subject: `Your code: ${otpCode}`,
        html: otpEmail({
          greeting: `Hey ${user.name}!`,
          message: "Enter this code to sign in to Fewwords:",
          otpCode,
        }),
      });
    }

    return {
      success: true,
      exists: true,
      message: "Verification code sent! Check your email.",
    };
  } catch {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to send verification code",
    });
  }
});
