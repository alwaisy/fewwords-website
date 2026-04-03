import { eq } from "drizzle-orm";

import { getSender } from "../config/emails";
import { addError } from "../lib/errors";
import { getRedis } from "../lib/redis";
import type {
  YouTubeSummaryTaskName,
  YouTubeSummaryTaskData,
  YouTubeSummaryTaskResult,
} from "../queues/youtube-summary";
import { summarize } from "../services/youtube";
import { notificationEmail } from "../templates/emails";

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
  const resendApiKey = config.private.resendApiKey;
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
    const { summaryId, url, notifyEmail } = job.data;

    console.log(`[YouTubeWorker] Starting job for ${summaryId}`);

    try {
      job.updateProgress(10);

      // summarize() handles ALL stages:
      // - setStage(metadata/transcript/classifying/summarizing/completed) via Redis
      // - saveMetadata() to youtube table
      // - saveResult() to summaries table
      // - status -> "completed"
      const result = await summarize(url, db, summaryId);

      job.updateProgress(90);

      // Fetch the original createdAt for total time calculation
      const summaryRecord = await db
        .select({ createdAt: summaries.createdAt })
        .from(summaries)
        .where(eq(summaries.summaryId, summaryId))
        .limit(1);

      const originalCreatedAt = summaryRecord[0]?.createdAt;
      const completedAt = new Date();

      // Belt and suspenders: ensure status is "completed"
      // (saveResult() should do this, but let's be sure)
      await db
        .update(summaries)
        .set({ status: "completed", completedAt })
        .where(eq(summaries.summaryId, summaryId));

      // Store total cycle time to youtube table (matches normal API flow)
      if (originalCreatedAt) {
        const totalTimeMs = completedAt.getTime() - originalCreatedAt.getTime();
        await db
          .update(youtube)
          .set({ totalTimeMs })
          .where(eq(youtube.summaryId, summaryId));
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

      // Save email error to DB as structured error log
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
        emailError, // Will be null if email sent successfully
      };
    } catch (error) {
      console.error(`[YouTubeWorker] Job failed for ${summaryId}:`, error);

      // ALWAYS set failed status - this is critical
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

      // Set Redis stage to "failed" so SSE closes the connection
      const redis = getRedis();
      await redis.set(`summary:${summaryId}:stage`, "failed", "EX", 3600);

      throw error; // Re-throw for BullMQ retry logic
    }
  },
  options: {
    concurrency: 3, // Process up to 3 long videos concurrently
  },
});
