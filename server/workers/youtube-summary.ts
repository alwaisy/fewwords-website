import { eq } from "drizzle-orm";

import { getSender } from "../config/emails";
import { getRedis } from "../lib/redis";
import type {
  YouTubeSummaryTaskName,
  YouTubeSummaryTaskData,
  YouTubeSummaryTaskResult,
} from "../queues/youtube-summary";
import { summarize } from "../services/youtube";

import { defineWorker } from "#processor";
import { summaries } from "~~/db/schema";
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
  const baseUrl = config.public.baseUrl || "http://localhost:3000";

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
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1a1a1a; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
                .header h1 { color: white; margin: 0; font-size: 24px; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
                .title { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #1a1a1a; }
                .button { display: inline-block; background: #667eea; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                .button:hover { background: #5568d3; }
                .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
                .footer a { color: #667eea; text-decoration: none; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Summary Ready!</h1>
                </div>
                <div class="content">
                  <p>Hi,</p>
                  <p>Your video summary is now ready.</p>

                  <div class="title">"${title}"</div>

                  <div style="text-align: center;">
                    <a href="${baseUrl}/app/${summaryId}" class="button">View Summary</a>
                  </div>

                  <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                    Or find it later in your <a href="${baseUrl}/app/library">library</a>.
                  </p>
                </div>
                <div class="footer">
                  <p>This is an automated message from Fewwords.</p>
                </div>
              </div>
            </body>
          </html>
        `,
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

      // Belt and suspenders: ensure status is "completed"
      // (saveResult() should do this, but let's be sure)
      await db
        .update(summaries)
        .set({ status: "completed", completedAt: new Date() })
        .where(eq(summaries.summaryId, summaryId));

      // Set Redis stage for SSE
      const redis = getRedis();
      await redis.set(`summary:${summaryId}:stage`, "completed", "EX", 3600);

      // Send email notification
      let emailError: string | null = null;
      if (notifyEmail) {
        console.log(`[YouTubeWorker] Sending email to ${notifyEmail}...`);
        emailError = await sendCompletionEmail(notifyEmail, result.title, summaryId);
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
        .set({ status: "failed", errorMessage })
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
