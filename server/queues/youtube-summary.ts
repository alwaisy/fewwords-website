import { defineQueue } from "#processor";

export type YouTubeSummaryTaskName = "youtube-summary";

export type YouTubeSummaryTaskData = {
  summaryId: string; // Public ID (few-XYZ)
  url: string;
  notifyEmail: string; // Passed from session at enqueue time
  userId: string; // ID of the user requesting the job to track quota
};

export type YouTubeSummaryTaskResult = {
  success: boolean;
  summaryId: string;
  title: string;
  emailError?: string | null; // Email error if sending failed (job still succeeds)
};

export default defineQueue<
  YouTubeSummaryTaskData,
  YouTubeSummaryTaskResult,
  YouTubeSummaryTaskName
>({
  name: "youtube-summary",
  options: {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000, // Start with 2s, then 4s, 8s
      },
      removeOnComplete: {
        count: 100, // Keep last 100 completed jobs
        age: 24 * 3600, // 24 hours
      },
      removeOnFail: {
        count: 500, // Keep last 500 failed jobs
        age: 7 * 24 * 3600, // 7 days
      },
    },
  },
});
