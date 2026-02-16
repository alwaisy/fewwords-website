import type { DemoTaskName, DemoTaskData, DemoTaskResult } from "../queues/demo-task";

import { defineWorker } from "#processor";

// Simulate work with delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Send completion email using Resend
async function sendCompletionEmail(
  email: string,
  userName: string,
  taskName: string,
  result: DemoTaskResult
) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = "testbs@m.fewwords.app";
  const fromName = "Fewwords";

  if (!resendApiKey) {
    console.warn("[DemoWorker] RESEND_API_KEY not set, skipping email");
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: email,
        subject: `✅ Your "${taskName}" task is complete!`,
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
                .stat-box { background: white; padding: 20px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #667eea; }
                .stat-label { font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: 600; }
                .stat-value { font-size: 24px; font-weight: bold; color: #1a1a1a; margin-top: 5px; }
                .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 Task Complete!</h1>
                </div>
                <div class="content">
                  <p>Hi <strong>${userName}</strong>,</p>
                  <p>Your task <strong>"${taskName}"</strong> has been processed successfully.</p>

                  <div class="stat-box">
                    <div class="stat-label">Steps Completed</div>
                    <div class="stat-value">${result.stepsCompleted}</div>
                  </div>

                  <div class="stat-box">
                    <div class="stat-label">Processing Time</div>
                    <div class="stat-value">${(result.duration / 1000).toFixed(2)}s</div>
                  </div>

                  <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
                    ${result.message}
                  </p>
                </div>
                <div class="footer">
                  <p>This is an automated message from the Fewwords Background Job Demo.</p>
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

    console.log(`[DemoWorker] Email sent to ${email}`);
  } catch (error) {
    console.error("[DemoWorker] Failed to send email:", error);
    // Don't throw - email failure shouldn't fail the job
  }
}

export default defineWorker<DemoTaskName, DemoTaskData, DemoTaskResult>({
  name: "demo-task",
  async processor(job) {
    const { email, userName, taskName, steps } = job.data;
    const startTime = Date.now();
    const totalSteps = steps + 1; // +1 for final step

    console.log(`[DemoWorker] Starting task "${taskName}" for ${userName} (${totalSteps} steps)`);

    // Helper to update progress (0-100)
    const updateProgress = (currentStep: number, message: string) => {
      const progress = Math.floor((currentStep / totalSteps) * 100);
      job.updateProgress(progress);
      console.log(`[DemoWorker] [${currentStep}/${totalSteps}] ${message} (${progress}%)`);
    };

    // Step 1: Initialize
    updateProgress(1, "Initializing task...");
    await delay(2000); // Simulate work

    // Step 2: Processing
    updateProgress(2, "Processing data...");
    await delay(2500);

    // Step 3-N: Simulate multi-step work
    for (let i = 3; i <= steps; i++) {
      updateProgress(i, `Processing step ${i}...`);
      await delay(1500 + Math.random() * 1000); // Random delay 1.5-2.5s
    }

    // Final step: Finalizing
    updateProgress(totalSteps, "Finalizing...");
    await delay(1000);

    const duration = Date.now() - startTime;
    const result: DemoTaskResult = {
      success: true,
      stepsCompleted: totalSteps,
      duration,
      message: `All ${totalSteps} steps completed successfully.`,
    };

    // Send completion email
    console.log(`[DemoWorker] Sending completion email to ${email}...`);
    await sendCompletionEmail(email, userName, taskName, result);

    console.log(`[DemoWorker] Task "${taskName}" completed in ${duration}ms`);

    return result;
  },
  options: {
    concurrency: 5, // Process up to 5 jobs concurrently
  },
});
