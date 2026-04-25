import { eq, sql } from "drizzle-orm";
import type { H3Event } from "h3";

import { users, type Plan } from "~~/database/orm/schema";

// Anonymous threshold: gate at 5 articles (1 credit per article)
const ANON_CREDIT_LIMIT = 5;

/**
 * Credit costs per plan and content type
 * Rule: Skim (free) has NO YouTube access.
 */
export const PLAN_CREDIT_COSTS: Record<
  Plan,
  {
    article: number;
    yt_short: number;
    yt_medium: number;
    yt_long: number;
  }
> = {
  skim: { article: 1, yt_short: Infinity, yt_medium: Infinity, yt_long: Infinity },
  read: { article: 1, yt_short: 3, yt_medium: 7, yt_long: 15 },
  digest: { article: 1, yt_short: 2, yt_medium: 6, yt_long: 14 },
  deep: { article: 1, yt_short: 3, yt_medium: 5, yt_long: 13 },
};

export interface QuotaResult {
  allowed: boolean;
  reason?: string;
  plan: Plan;
  creditsUsed: number;
  creditsLimit: number;
  isLoggedIn: boolean;
  cancelAtPeriodEnd?: boolean;
  periodResetAt?: Date | null;
}

/**
 * Calculate required credits based on content type and duration.
 */
export function getRequiredCredits(
  plan: Plan,
  essence: "article" | "youtube" | "reddit",
  durationMinutes?: number,
): number {
  // Defensive check: ensure plan is valid
  const planKey = (plan && PLAN_CREDIT_COSTS[plan]) ? plan : "skim";
  const costs = PLAN_CREDIT_COSTS[planKey];

  if (essence === "article" || essence === "reddit") {
    return costs.article;
  }

  if (essence === "youtube") {
    if (!durationMinutes) return costs.yt_short; // Default to short

    if (durationMinutes <= 20) return costs.yt_short;
    if (durationMinutes <= 60) return costs.yt_medium;
    return costs.yt_long;
  }

  return 1; // Fallback
}

/**
 * Lazy Credit Reset
 * Resets creditsUsed if the billing period has ended.
 * Returns the current (possibly reset) creditsUsed.
 */
export async function syncUserQuota(event: H3Event, user: { id: string; creditsUsed: number; periodResetAt: Date | null }): Promise<number> {
  if (user.periodResetAt && new Date() > new Date(user.periodResetAt)) {
    const db = await useDb(event);
    console.log(`[Quota] Period ended for ${user.id}. Resetting credits...`);
    
    // Calculate next reset (usually +1 month from current reset)
    const nextReset = new Date(user.periodResetAt);
    nextReset.setMonth(nextReset.getMonth() + 1);
    
    await db.update(users)
      .set({
        creditsUsed: 0,
        periodResetAt: nextReset,
      })
      .where(eq(users.id, user.id));
    
    return 0;
  }
  return user.creditsUsed;
}

/**
 * Check if a user/anonymous session can create a new summary.
 */
export async function checkQuota(
  event: H3Event,
  userId: string | null,
  essence: "article" | "youtube" | "reddit" = "article",
  durationMinutes?: number,
): Promise<QuotaResult> {
  // Logged-in user: check DB
  if (userId) {
    const db = await useDb(event);
    const userRows = await db
      .select({
        id: users.id,
        plan: users.plan,
        creditsUsed: users.creditsUsed,
        creditsLimit: users.creditsLimit,
        polarStatus: users.polarStatus,
        cancelAtPeriodEnd: users.cancelAtPeriodEnd,
        periodResetAt: users.periodResetAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const user = userRows[0];
    if (!user) {
      return {
        allowed: false,
        reason: "User not found",
        plan: "skim",
        creditsUsed: 0,
        creditsLimit: 0,
        isLoggedIn: true,
      };
    }

    // 0. Lazy Credit Reset (Check if current period ended)
    const currentCreditsUsed = await syncUserQuota(event, user);

    // 1. Check Polar Status (Block if payment failed or subscription ended)
    const blockedStatuses = ["past_due", "deleted", "paused", "inactive", "revoked"];
    if (user.polarStatus && blockedStatuses.includes(user.polarStatus)) {
      return {
        allowed: false,
        reason: "Your subscription is inactive. Please check your billing status.",
        plan: user.plan,
        creditsUsed: user.creditsUsed,
        creditsLimit: user.creditsLimit,
        isLoggedIn: true,
        cancelAtPeriodEnd: user.cancelAtPeriodEnd ?? false,
        periodResetAt: user.periodResetAt,
      };
    }

    // 2. YouTube blocking for Skim
    if (user.plan === "skim" && essence === "youtube") {
      return {
        allowed: false,
        reason: "YouTube summaries require the Read plan.",
        plan: user.plan,
        creditsUsed: currentCreditsUsed,
        creditsLimit: user.creditsLimit,
        isLoggedIn: true,
        cancelAtPeriodEnd: user.cancelAtPeriodEnd ?? false,
        periodResetAt: user.periodResetAt,
      };
    }

    // 2. Check credits
    const required = getRequiredCredits(user.plan, essence, durationMinutes);
    const remaining = user.creditsLimit - currentCreditsUsed;

    if (remaining < required) {
      return {
        allowed: false,
        reason: `You need ${required} credits for this, but only have ${remaining} remaining.`,
        plan: user.plan,
        creditsUsed: currentCreditsUsed,
        creditsLimit: user.creditsLimit,
        isLoggedIn: true,
        cancelAtPeriodEnd: user.cancelAtPeriodEnd ?? false,
        periodResetAt: user.periodResetAt,
      };
    }

    return {
      allowed: true,
      plan: user.plan,
      creditsUsed: currentCreditsUsed,
      creditsLimit: user.creditsLimit,
      isLoggedIn: true,
      cancelAtPeriodEnd: user.cancelAtPeriodEnd ?? false,
      periodResetAt: user.periodResetAt,
    };
  }

  // Anonymous user: check server session
  // Rule: Anonymous cannot use YouTube
  if (essence === "youtube") {
    return {
      allowed: false,
      reason: "Sign up free to summarize YouTube videos.",
      plan: "skim",
      creditsUsed: 0,
      creditsLimit: 8,
      isLoggedIn: false,
    };
  }

  const anonCredits = await getAnonCreditsUsed(event);

  if (anonCredits >= ANON_CREDIT_LIMIT) {
    return {
      allowed: false,
      reason: "Sign up free to keep summarizing.",
      plan: "skim",
      creditsUsed: anonCredits,
      creditsLimit: 8,
      isLoggedIn: false,
    };
  }

  return {
    allowed: true,
    plan: "skim",
    creditsUsed: anonCredits,
    creditsLimit: ANON_CREDIT_LIMIT,
    isLoggedIn: false,
  };
}

/**
 * Deduct credits after a summary completes.
 */
export async function deductCredits(
  event: H3Event,
  userId: string | null,
  essence: "article" | "youtube" | "reddit",
  durationMinutes?: number,
): Promise<void> {
  if (userId) {
    const db = await useDb(event);
    const userRows = await db
      .select({ plan: users.plan })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const user = userRows[0];
    if (!user) return;

    const cost = getRequiredCredits(user.plan, essence, durationMinutes);

    await db
      .update(users)
      .set({
        creditsUsed: sql`${users.creditsUsed} + ${cost}`,
      })
      .where(eq(users.id, userId));

    // Update session with new count
    const updatedRows = await db
      .select({ creditsUsed: users.creditsUsed })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const current = updatedRows[0];
    if (current) {
      const session = await getUserSession(event);
      await setUserSession(event, {
        ...session,
        user: {
          ...(session?.user as object),
          creditsUsed: current.creditsUsed,
        },
      } as typeof session extends undefined ? never : typeof session);
    }
  } else {
    // Anonymous: update server session (only articles allowed)
    const current = await getAnonCreditsUsed(event);
    await setAnonCreditsUsed(event, current + 1);
  }
}

/**
 * Count words in a text string.
 */
export function countWords(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  return text.trim().split(/\s+/).length;
}

// ─── Anonymous session helpers ───

const ANON_CREDITS_KEY = "anon_credits_used";

async function getAnonCreditsUsed(event: H3Event): Promise<number> {
  const session = await getUserSession(event);
  return ((session as unknown as Record<string, unknown>)[ANON_CREDITS_KEY] as number) ?? 0;
}

async function setAnonCreditsUsed(
  event: H3Event,
  count: number,
): Promise<void> {
  const session = await getUserSession(event);
  await setUserSession(event, {
    ...session,
    [ANON_CREDITS_KEY]: count,
  } as typeof session extends undefined ? never : typeof session);
}
