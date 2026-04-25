import type { CustomerStateSubscription } from "@polar-sh/sdk/models/components/customerstatesubscription";
import type { Subscription } from "@polar-sh/sdk/models/components/subscription";
import type { WebhookCustomerStateChangedPayload } from "@polar-sh/sdk/models/components/webhookcustomerstatechangedpayload";
import type { WebhookSubscriptionActivePayload } from "@polar-sh/sdk/models/components/webhooksubscriptionactivepayload";
import type { WebhookSubscriptionRevokedPayload } from "@polar-sh/sdk/models/components/webhooksubscriptionrevokedpayload";
import type { WebhookSubscriptionUpdatedPayload } from "@polar-sh/sdk/models/components/webhooksubscriptionupdatedpayload";
import { eq } from "drizzle-orm";
import type { H3Event } from "h3";

import { users, PLAN_CREDITS, type Plan } from "~~/database/orm/schema";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  
  return Webhooks({
    webhookSecret: config.private.polarWebhookSecret,

    onSubscriptionActive: async (payload: WebhookSubscriptionActivePayload) => {
      console.log(`[Polar Webhook] Signal: subscription.active`);
      await syncUserSubscription(event, payload.data.customer.email, payload.data);
    },

    onSubscriptionUpdated: async (payload: WebhookSubscriptionUpdatedPayload) => {
      console.log(`[Polar Webhook] Signal: subscription.updated`);
      await syncUserSubscription(event, payload.data.customer.email, payload.data);
    },

    onSubscriptionRevoked: async (payload: WebhookSubscriptionRevokedPayload) => {
      console.log(`[Polar Webhook] Signal: subscription.revoked`);
      const db = await useDb(event);
      const email = payload.data.customer.email;
      if (email) {
        await db
          .update(users)
          .set({
            plan: "skim",
            creditsLimit: PLAN_CREDITS.skim,
            polarStatus: "revoked",
            cancelAtPeriodEnd: false,
          })
          .where(eq(users.email, email));
      }
    },

    onCustomerStateChanged: async (payload: WebhookCustomerStateChangedPayload) => {
      console.log(`[Polar Webhook] Signal: customer.state_changed`);
      const email = payload.data.email;
      const primarySub = payload.data.activeSubscriptions?.[0];
      if (email) {
        if (primarySub) {
          await syncUserSubscription(event, email, primarySub);
        } else {
          const db = await useDb(event);
          await db
            .update(users)
            .set({
              plan: "skim",
              creditsLimit: PLAN_CREDITS.skim,
              polarStatus: "inactive",
            })
            .where(eq(users.email, email));
        }
      }
    },
  })(event);
});

/**
 * Helper to sync user plan and credits from a Polar subscription object.
 */
async function syncUserSubscription(
  event: H3Event, 
  customerEmail: string, 
  polarSub: Subscription | CustomerStateSubscription
) {
  const db = await useDb(event);

  if (!customerEmail) return;

  let planName = "skim";
  if ('product' in polarSub && polarSub.product) {
    planName = polarSub.product.name;
  } else {
    try {
      const polar = getPolarClient();
      const product = await polar.products.get({ id: polarSub.productId });
      planName = product.name;
    } catch (e) {
      console.error("[Polar Webhook] Failed to fetch product details", e);
    }
  }

  const plan = planName.toLowerCase() as Plan;
  const productId = polarSub.productId;

  console.log(`[Polar Webhook] Syncing user ${customerEmail} to plan ${plan}`);

  // Determine customer ID safely
  let polarCustomerId: string | undefined;
  if ('customerId' in polarSub) {
    polarCustomerId = polarSub.customerId;
  }

  const userRows = await db.select({ periodResetAt: users.periodResetAt }).from(users).where(eq(users.email, customerEmail)).limit(1);
  const currentUser = userRows[0];

  const newPeriodResetAt = polarSub.currentPeriodEnd ? new Date(polarSub.currentPeriodEnd) : null;
  let creditsUsedUpdate = {};

  if (currentUser && currentUser.periodResetAt && newPeriodResetAt) {
    if (newPeriodResetAt > currentUser.periodResetAt) {
      console.log(`[Polar Webhook] New billing period detected for ${customerEmail}. Resetting credits...`);
      creditsUsedUpdate = { creditsUsed: 0 };
    }
  }

  await db
    .update(users)
    .set({
      plan,
      creditsLimit: PLAN_CREDITS[plan],
      ...creditsUsedUpdate,
      polarCustomerId,
      polarSubscriptionId: polarSub.id,
      polarProductId: productId,
      polarStatus: polarSub.status,
      cancelAtPeriodEnd: polarSub.cancelAtPeriodEnd === true,
      periodResetAt: newPeriodResetAt,
    })
    .where(eq(users.email, customerEmail));
}
