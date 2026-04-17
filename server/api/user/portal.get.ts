import { Paddle, Environment } from "@paddle/paddle-node-sdk";
import { eq } from "drizzle-orm";

import { users } from "~~/database/orm/schema";

/**
 * GET /api/user/portal
 * Generates a secure Paddle Customer Portal link.
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  const userId = session?.user ? (session.user as { id: string }).id : null;

  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const db = await useDb(event);
  const userRows = await db
    .select({ 
      paddleCustomerId: users.paddleCustomerId,
      paddleSubscriptionId: users.paddleSubscriptionId
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const user = userRows[0];

  // If no customer ID yet, they are Free/Skim and haven't entered billing
  if (!user?.paddleCustomerId) {
    throw createError({ 
      statusCode: 404, 
      statusMessage: "No billing profile found. Please subscribe to a plan first." 
    });
  }

  const config = useRuntimeConfig(event);
  const paddle = new Paddle(config.private.paddleKey!, {
    environment: config.public.paddleEnv === 'production' ? Environment.production : Environment.sandbox
  });

  try {
    // Generate the portal link
    const subId = user.paddleSubscriptionId;
    
    if (subId) {
      const subscription = await paddle.subscriptions.get(subId);
      if (subscription.managementUrls?.updatePaymentMethod) {
        // Return the general management URL (or specific one)
        return { url: subscription.managementUrls.cancel || subscription.managementUrls.updatePaymentMethod };
      }
    }

    // Fallback: If no subscription but they are a customer
    throw createError({ statusCode: 404, statusMessage: "Active subscription not found." });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[Portal API] Error:", msg);
    throw createError({ 
      statusCode: 500, 
      statusMessage: "Could not generate billing portal link." 
    });
  }
});
