import { eq, sql } from "drizzle-orm";
import type { H3Event } from "h3";

import { users, PLAN_WORD_LIMITS } from "~~/db/schema";

// Anonymous threshold: gate at 900 (before 1000 hard limit)
const ANON_GATE_THRESHOLD = 900;

export interface QuotaResult {
  allowed: boolean;
  reason?: string;
  wordsUsed: number;
  wordsLimit: number;
  isLoggedIn: boolean;
}

/**
 * Check if a user/anonymous session can create a new summary.
 *
 * Rules:
 * - Anonymous: gate at 1800 words (sign-up CTA)
 * - Registered: allow if wordsUsed < wordsLimit (hard check at start only)
 * - Pro: allow if wordsUsed < wordsLimit
 */
export async function checkQuota(
  event: H3Event,
  userId: string | null,
): Promise<QuotaResult> {
  // Logged-in user: check DB
  if (userId) {
    const db = await useDb(event);
    const userRows = await db
      .select({
        plan: users.plan,
        wordsUsed: users.wordsUsed,
        wordsLimit: users.wordsLimit,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const user = userRows[0];
    if (!user) {
      return {
        allowed: false,
        reason: "User not found",
        wordsUsed: 0,
        wordsLimit: 0,
        isLoggedIn: true,
      };
    }

    // At or past limit → block
    if (user.wordsUsed >= user.wordsLimit) {
      return {
        allowed: false,
        reason:
          user.plan === "free"
            ? "You've reached your free limit. Join the waitlist for more."
            : "You've reached your plan limit.",
        wordsUsed: user.wordsUsed,
        wordsLimit: user.wordsLimit,
        isLoggedIn: true,
      };
    }

    return {
      allowed: true,
      wordsUsed: user.wordsUsed,
      wordsLimit: user.wordsLimit,
      isLoggedIn: true,
    };
  }

  // Anonymous user: check server session
  const anonWords = await getAnonWordsUsed(event);

  if (anonWords >= ANON_GATE_THRESHOLD) {
    return {
      allowed: false,
      reason: "Sign up free to keep summarizing.",
      wordsUsed: anonWords,
      wordsLimit: PLAN_WORD_LIMITS.free,
      isLoggedIn: false,
    };
  }

  return {
    allowed: true,
    wordsUsed: anonWords,
    wordsLimit: ANON_GATE_THRESHOLD,
    isLoggedIn: false,
  };
}

/**
 * Increment word count after a summary completes.
 * For logged-in users: updates DB.
 * For anonymous: updates server session.
 */
export async function incrementWordCount(
  event: H3Event,
  userId: string | null,
  wordCount: number,
): Promise<void> {
  if (userId) {
    const db = await useDb(event);
    // Use sql template for column arithmetic
    await db
      .update(users)
      .set({
        wordsUsed: sql`${users.wordsUsed} + ${wordCount}`,
      })
      .where(eq(users.id, userId));

    // Update session with new count
    const userRows = await db
      .select({ wordsUsed: users.wordsUsed })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const current = userRows[0];
    if (current) {
      const session = await getUserSession(event);
      await setUserSession(event, {
        ...session,
        user: {
          ...(session?.user as object),
          wordsUsed: current.wordsUsed,
        },
      } as typeof session extends undefined ? never : typeof session);
    }
  } else {
    // Anonymous: update server session
    const current = await getAnonWordsUsed(event);
    await setAnonWordsUsed(event, current + wordCount);
  }
}

/**
 * Count words in a text string.
 */
export function countWords(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  return text.trim().split(/\s+/).length;
}

// ─── Anonymous session helpers (server-side, not localStorage) ───

const ANON_WORDS_KEY = "anon_words_used";

async function getAnonWordsUsed(event: H3Event): Promise<number> {
  const session = await getUserSession(event);
  return ((session as unknown as Record<string, unknown>)[ANON_WORDS_KEY] as number) ?? 0;
}

async function setAnonWordsUsed(
  event: H3Event,
  count: number,
): Promise<void> {
  const session = await getUserSession(event);
  await setUserSession(event, {
    ...session,
    [ANON_WORDS_KEY]: count,
  } as typeof session extends undefined ? never : typeof session);
}
