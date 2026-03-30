import { getRouterParam } from "h3";

import { getRedis } from "../../../lib/redis";

/**
 * SSE #2 Endpoint for Background Jobs
 *
 * This is a separate SSE endpoint specifically for background jobs (21-180 min videos).
 * It has a longer timeout (7.5 minutes) compared to SSE #1 since background jobs take longer.
 *
 * Polls Redis for stage updates: metadata → classifying → summarizing → completed
 */
export default defineEventHandler(async (event) => {
  const summaryId = getRouterParam(event, "summaryId");

  if (!summaryId) {
    throw createError({
      statusCode: 400,
      statusMessage: "summaryId is required",
    });
  }

  // Set SSE headers
  setHeader(event, "content-type", "text/event-stream");
  setHeader(event, "cache-control", "no-cache");
  setHeader(event, "connection", "keep-alive");
  setHeader(event, "x-accel-buffering", "no"); // Disable nginx buffering

  console.log(`[SSE#2] Connection opened for background job: ${summaryId}`);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let lastStage: string | null = null;
      let pollCount = 0;
      let pollInterval: NodeJS.Timeout | null = null;
      let keepAliveInterval: NodeJS.Timeout | null = null;

      const MAX_POLL_COUNT = 900; // 900 * 500ms = 7.5 minutes max
      const POLL_INTERVAL_MS = 500;

      // Helper to send SSE message
      const sendEvent = (data: unknown) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        console.log(`[SSE#2] → Sending to ${summaryId}:`, message.trim());
        try {
          controller.enqueue(encoder.encode(message));
        } catch {
          // Controller may already be closed/errored
        }
      };

      // Helper to send keep-alive comments
      const sendKeepAlive = () => {
        try {
          controller.enqueue(encoder.encode(": keep-alive\n\n"));
        } catch {
          // Controller may already be closed/errored
        }
      };

      const close = () => {
        try {
          controller.close();
        } catch {
          // Stream might already be closed
        }
      };

      try {
        // Send initial stage immediately
        const redis = getRedis();
        const initialStage = (await redis.get(
          `summary:${summaryId}:stage`,
        )) as string | null;
        console.log(`[SSE#2] Initial stage for ${summaryId}: ${initialStage}`);
        lastStage = initialStage;
        sendEvent({ stage: initialStage });

        // Stop immediately if already completed
        if (initialStage === "completed" || initialStage === "failed") {
          console.log(
            `[SSE#2] ✓ Already ${initialStage} - closing stream for ${summaryId}`,
          );
          close();
          return;
        }

        // Poll Redis for stage changes every 500ms
        console.log(
          `[SSE#2] Starting poll loop for ${summaryId} (${POLL_INTERVAL_MS}ms interval)`,
        );

        pollInterval = setInterval(async () => {
          pollCount++;

          // TIMEOUT CHECK
          if (pollCount > MAX_POLL_COUNT) {
            console.log(
              `[SSE#2] ⚠ Timeout for ${summaryId} after ${pollCount} polls (${(pollCount * POLL_INTERVAL_MS) / 1000}s)`,
            );
            sendEvent({
              stage: "timeout",
              message: "Processing took too long. Please refresh the page.",
            });
            if (pollInterval) {
              clearInterval(pollInterval);
              pollInterval = null;
            }
            close();
            return;
          }

          try {
            const redis = getRedis();
            const currentStage = (await redis.get(
              `summary:${summaryId}:stage`,
            )) as string | null;

            // Only send update if stage changed
            if (currentStage !== lastStage) {
              console.log(
                `[SSE#2] ✓ STAGE CHANGED for ${summaryId}: ${lastStage} → ${currentStage}`,
              );
              lastStage = currentStage;
              sendEvent({ stage: currentStage });

              // Stop polling if completed or failed
              if (currentStage === "completed" || currentStage === "failed") {
                console.log(
                  `[SSE#2] ✓ ${currentStage.toUpperCase()} - stopping poll for ${summaryId}`,
                );
                if (pollInterval) {
                  clearInterval(pollInterval);
                  pollInterval = null;
                }
                close();
              }
            }
          } catch (err) {
            console.error(`[SSE#2] ✗ Error polling Redis for ${summaryId}:`, err);
          }
        }, POLL_INTERVAL_MS);

        // Send keep-alive every 30 seconds to prevent timeout
        keepAliveInterval = setInterval(() => {
          sendKeepAlive();
        }, 30000);

        // Cleanup on client disconnect
        event.node.req.on("close", () => {
          console.log(`[SSE#2] Connection closed for ${summaryId}`);
          if (pollInterval) {
            clearInterval(pollInterval);
          }
          if (keepAliveInterval) {
            clearInterval(keepAliveInterval);
          }
          close();
        });

        event.node.req.on("error", (error) => {
          console.error(`[SSE#2] Request error for ${summaryId}:`, error);
        });
      } catch (error) {
        console.error(`[SSE#2] Error setting up stream for ${summaryId}:`, error);
        try {
          controller.error(error);
        } catch {
          // Controller may already be closed
        }
      }
    },
  });

  return sendStream(event, stream);
});
