import { eq } from "drizzle-orm";

import { useDb } from "../db";
import { checkQuota } from "../services/quota";
import { getPolarClient } from "../utils/polar";

import { users, PLAN_CREDITS, type Plan } from "~~/database/orm/schema";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  const userId = session?.user
    ? (session.user as { id: string }).id
    : null;

  const email = session?.user
    ? (session.user as { email: string }).email
    : null;

  // 1. Initial Quota Check (from DB)
  let quota = await checkQuota(event, userId);

  // 2. Real-time Reconciliation (Optional but good for post-purchase UX)
  // If the user is logged in but has a 'skim' plan, double check Polar API
  if (userId && email && quota.plan === 'skim') {
    const config = useRuntimeConfig(event);
    const polar = getPolarClient();
    
    try {
      // Fetch active subscriptions for this customer email
      const subs = await polar.subscriptions.list({
        organizationId: config.private.polarOrganizationId as string,
        active: true,
      });

      const userSub = subs.result.items.find(s => s.customer?.email === email);
      
      if (userSub) {
        const planName = userSub.product?.name || "skim";
        const plan = planName.toLowerCase() as Plan;
        
        if (plan !== 'skim') {
          const db = await useDb(event);
          await db.update(users).set({
            plan,
            creditsLimit: PLAN_CREDITS[plan],
            polarCustomerId: userSub.customerId,
            polarSubscriptionId: userSub.id,
            polarProductId: userSub.productId,
            polarStatus: userSub.status,
            cancelAtPeriodEnd: userSub.cancelAtPeriodEnd,
          }).where(eq(users.id, userId));

          // Refresh quota result
          quota = await checkQuota(event, userId);
        }
      }
    } catch (err) {
      console.error("[Quota API] Real-time sync failed:", err);
    }
  }

  return {
    creditsUsed: quota.creditsUsed,
    creditsLimit: quota.creditsLimit,
    plan: quota.plan,
    isLoggedIn: quota.isLoggedIn,
    allowed: quota.allowed,
    cancelAtPeriodEnd: quota.cancelAtPeriodEnd,
    periodResetAt: quota.periodResetAt,
  };
});
