import { eq } from "drizzle-orm";
import type { H3Event, H3Context } from "h3";

import { getSender } from "../config/emails";
import { addError } from "../lib/errors";
import { getRedis } from "../lib/redis";
import type {
  YouTubeSummaryTaskName,
  YouTubeSummaryTaskData,
  YouTubeSummaryTaskResult,
} from "../queues/youtube-summary";
import { deductCredits } from "../services/quota";
import { summarize } from "../services/youtube";
import { notificationEmail } from "../templates/emails";
import { getBaseUrl } from "../utils/url";

import { useRuntimeConfig } from "#imports";
import { defineWorker } from "#processor";
import { summaries, youtube } from "~~/database/orm/schema";
import { db } from "~~/server/db/index";

// Send completion email using Resend
// Returns error message if failed, null if success
async function sendCompletionEmail(
  email: string,
  title: string,
  summaryId: string,
): Promise<string | null> {
  const config = useRuntimeConfig();
  const resendApiKey = String(config.private.resendApiKey);
  const baseUrl = getBaseUrl();

  if (!resendApiKey) {
    console.warn("[YouTubeWorker] RESEND_API_KEY not set, skipping email");
    return "RESEND_API_KEY not set";
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getSender("notify"),
        to: email,
        subject: `Your summary is ready: ${title}`,
        html: notificationEmail({
          title: "Summary Ready!",
          message: `Your video summary for "${title}" is now ready.`,
          buttonText: "View Summary",
          buttonUrl: `${baseUrl}/app/${summaryId}`,
          secondaryLink: {
            text: "Or find it later in your library",
            url: `${baseUrl}/app/library`,
          },
        }),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error: ${error}`);
    }

    console.log(`[YouTubeWorker] Email sent to ${email}`);
    return null; // Success
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[YouTubeWorker] Failed to send email:", errorMessage);
    return errorMessage; // Return error for logging
  }
}

export default defineWorker<
  YouTubeSummaryTaskName,
  YouTubeSummaryTaskData,
  YouTubeSummaryTaskResult
>({
  name: "youtube-summary",
  async processor(job) {
    const { summaryId, url, notifyEmail, userId } = job.data;
    
    // Create a properly typed minimal H3Event mock
    const event = {
      context: {
        user: userId ? { id: userId } : null
      } as unknown as H3Context
    } as unknown as H3Event;

    console.log(`[YouTubeWorker] Starting job for ${summaryId}`);

    try {
      job.updateProgress(10);

      // summarize() handles ALL stages
      const result = await summarize(url, db, summaryId);

      job.updateProgress(90);

      // Fetch the original createdAt and internal ID for total time calculation
      const summaryRecord = await db
        .select({ id: summaries.id, createdAt: summaries.createdAt })
        .from(summaries)
        .where(eq(summaries.summaryId, summaryId))
        .limit(1);

      const originalCreatedAt = summaryRecord[0]?.createdAt;
      const internalId = summaryRecord[0]?.id;
      const completedAt = new Date();

      // Deduct credits on success
      if (userId && internalId) {
        const ytRecord = await db
          .select({ duration: youtube.duration })
          .from(youtube)
          .where(eq(youtube.summaryId, internalId))
          .limit(1);
        
        const durationStr = ytRecord[0]?.duration || "0";
        const durationMinutes = parseFloat(durationStr);
        await deductCredits(event, userId, "youtube", durationMinutes, summaryId);
      }

      // Belt and suspenders: ensure status is "completed"
      await db
        .update(summaries)
        .set({ status: "completed", completedAt })
        .where(eq(summaries.summaryId, summaryId));

      // Store total cycle time
      if (originalCreatedAt && internalId) {
        const totalTimeMs = completedAt.getTime() - originalCreatedAt.getTime();
        await db
          .update(youtube)
          .set({ totalTimeMs })
          .where(eq(youtube.summaryId, internalId));
      }

      // Set Redis stage for SSE
      const redis = getRedis();
      await redis.set(`summary:${summaryId}:stage`, "completed", "EX", 3600);

      // Send email notification
      let emailError: string | null = null;
      if (notifyEmail) {
        console.log(`[YouTubeWorker] Sending email to ${notifyEmail}...`);
        emailError = await sendCompletionEmail(notifyEmail, result.title, summaryId);
      }

      // Save email error to DB
      if (emailError) {
        const currentRecord = await db
          .select({ errorMessage: summaries.errorMessage })
          .from(summaries)
          .where(eq(summaries.summaryId, summaryId))
          .limit(1);

        const updatedErrors = addError(currentRecord[0]?.errorMessage ?? null, {
          type: "email",
          message: emailError,
        });

        await db
          .update(summaries)
          .set({ errorMessage: updatedErrors })
          .where(eq(summaries.summaryId, summaryId));
      }

      job.updateProgress(100);

      console.log(`[YouTubeWorker] Job completed for ${summaryId}`);

      return {
        success: true,
        summaryId,
        title: result.title,
        emailError,
      };
    } catch (error) {
      console.error(`[YouTubeWorker] Job failed for ${summaryId}:`, error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      await db
        .update(summaries)
        .set({
          status: "failed",
          errorMessage: addError(null, {
            type: "unknown",
            message: errorMessage,
            raw: error instanceof Error ? error.stack : undefined,
          }),
        })
        .where(eq(summaries.summaryId, summaryId));

      const redis = getRedis();
      await redis.set(`summary:${summaryId}:stage`, "failed", "EX", 3600);

      throw error;
    }
  },
  options: {
    concurrency: 3,
  },
});
