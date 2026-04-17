import { Paddle, EventName, Environment } from "@paddle/paddle-node-sdk";
import type { 
  SubscriptionActivatedEvent, 
  SubscriptionUpdatedEvent, 
  SubscriptionCanceledEvent,
  TransactionCompletedEvent
} from "@paddle/paddle-node-sdk";
import { eq } from "drizzle-orm";

import { users, PLAN_CREDITS, type Plan } from "~~/database/orm/schema";

/**
 * Robust interface for Paddle event data payloads
 */
interface PaddleEventData {
  customerId: string;
  customer?: {
    email: string;
  };
  customData?: {
    userEmail?: string;
  };
}

/**
 * Paddle Webhook Handler
 * Path: /api/webhooks/paddle
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const signature = getHeader(event, "paddle-signature") || "";
  const rawBody = await readRawBody(event, "utf8") || "";

  if (!config.private.paddleKey || !config.private.paddleWebhookSecret) {
    console.error("[Paddle Webhook] ERROR: Missing API Key or Webhook Secret");
    throw createError({ statusCode: 500, statusMessage: "Billing misconfigured" });
  }

  const paddle = new Paddle(config.private.paddleKey, {
    environment: config.public.paddleEnv === 'production' ? Environment.production : Environment.sandbox
  });

  try {
    const eventData = await paddle.webhooks.unmarshal(rawBody, config.private.paddleWebhookSecret, signature);
    
    if (!eventData) {
      console.error("[Paddle Webhook] ERROR: Invalid signature verification");
      throw createError({ statusCode: 400, statusMessage: "Invalid signature" });
    }

    const db = await useDb(event);
    console.log(`[Paddle Webhook] RECEIVED EVENT: ${eventData.eventType}`);

    const priceMap: Record<string, Plan> = {
      [String(config.public.prices.read)]: "read",
      [String(config.public.prices.digest)]: "digest",
      [String(config.public.prices.deep)]: "deep",
    };

    // Helper to get email from event data or fetch from API
    async function getCustomerEmail(data: PaddleEventData): Promise<string> {
      // 1. Try customData backup (sent from usePaddle composable)
      if (data.customData?.userEmail) return data.customData.userEmail;
      
      // 2. Try nested customer object
      if (data.customer?.email) return data.customer.email;
      
      // 3. Fetch via API using customerId as last resort
      if (data.customerId) {
        try {
          const customer = await paddle.customers.get(data.customerId);
          return customer.email;
        } catch (err) {
          console.error("[Paddle Webhook] Failed to fetch customer email:", err);
        }
      }
      return "";
    }

    switch (eventData.eventType) {
      case EventName.TransactionCompleted: {
        const txn = eventData.data as TransactionCompletedEvent["data"];
        const customerId = txn.customerId;
        const subscriptionId = txn.subscriptionId || null;
        const priceId = txn.items[0]?.price?.id || "";
        const plan = priceMap[priceId] || "skim";
        
        const userEmail = await getCustomerEmail(txn as unknown as PaddleEventData);

        if (userEmail && plan !== "skim") {
          await db.update(users)
            .set({
              plan,
              creditsLimit: PLAN_CREDITS[plan],
              creditsUsed: 0,
              paddleCustomerId: customerId,
              paddleSubscriptionId: subscriptionId,
              paddlePriceId: priceId,
              paddleStatus: "active",
            })
            .where(eq(users.email, userEmail));
          
          console.log(`[Paddle Webhook] SUCCESS: ${userEmail} upgraded via Transaction.`);
        }
        break;
      }

      case EventName.SubscriptionActivated:
      case EventName.SubscriptionUpdated:
      case EventName.SubscriptionResumed: {
        const sub = eventData.data as (SubscriptionActivatedEvent["data"] | SubscriptionUpdatedEvent["data"]);
        const customerId = sub.customerId;
        const subscriptionId = sub.id;
        const priceId = sub.items[0]?.price?.id || "";
        const plan = priceMap[priceId] || "skim";
        
        const userEmail = await getCustomerEmail(sub as unknown as PaddleEventData);

        if (userEmail) {
          await db.update(users)
            .set({
              plan,
              creditsLimit: PLAN_CREDITS[plan],
              // Only reset credits if it's a new period or explicit upgrade
              // (Note: creditsUsed reset logic can be refined based on business rules)
              paddleCustomerId: customerId,
              paddleSubscriptionId: subscriptionId,
              paddlePriceId: priceId,
              paddleStatus: sub.status,
              periodResetAt: sub.currentBillingPeriod ? new Date(sub.currentBillingPeriod.endsAt) : null,
              cancelAtPeriodEnd: sub.scheduledChange?.action === "cancel",
            })
            .where(eq(users.email, userEmail));
          
          console.log(`[Paddle Webhook] SUCCESS: ${userEmail} synced via Subscription (${eventData.eventType}).`);
        }
        break;
      }

      case EventName.SubscriptionPaused: {
        const sub = eventData.data as SubscriptionUpdatedEvent["data"];
        await db.update(users)
          .set({
            paddleStatus: "paused",
          })
          .where(eq(users.paddleSubscriptionId, sub.id));
        
        console.log(`[Paddle Webhook] Subscription ${sub.id} paused.`);
        break;
      }

      case EventName.SubscriptionCanceled: {
        const sub = eventData.data as SubscriptionCanceledEvent["data"];
        await db.update(users)
          .set({
            plan: "skim",
            creditsLimit: PLAN_CREDITS.skim,
            paddleStatus: "deleted",
            cancelAtPeriodEnd: false,
          })
          .where(eq(users.paddleSubscriptionId, sub.id));
        
        console.log(`[Paddle Webhook] Subscription ${sub.id} ended.`);
        break;
      }
    }

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[Paddle Webhook] ERROR:", msg);
    throw createError({ statusCode: 400, statusMessage: "Webhook processing failed" });
  }
});
