import { eq } from "drizzle-orm";
import { getRouterParam } from "h3";

import { getRedis } from "../../../lib/redis";

import { summaries } from "~~/database/orm/schema";

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

  console.log(`[SSE] Connection opened for summaryId: ${summaryId}`);

  // Create readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let lastStage: string | null = null;
      let pollInterval: NodeJS.Timeout | null = null;

      // Helper to send SSE message
      const sendEvent = (data: unknown) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        console.log(`[SSE] → Sending message: ${message.trim()}`);
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
        console.log(`[SSE] Fetching initial stage for ${summaryId}...`);
        const redis = getRedis();
        const initialStage = (await redis.get(`summary:${summaryId}:stage`)) as string | null;
        console.log(`[SSE] Initial stage: ${initialStage}`);
        lastStage = initialStage;
        sendEvent({ stage: initialStage });

        // Stop immediately if already completed
        if (initialStage === "completed") {
          console.log(`[SSE] ✓ Already completed - closing stream for ${summaryId}`);
          close();
          return;
        }

        // If stage is null, check database to see if summary is already done
        if (initialStage === null) {
          console.log(`[SSE] Stage is null, checking database status...`);
          const db = await useDb(event);
          const summaryRecord = await db
            .select({ status: summaries.status })
            .from(summaries)
            .where(eq(summaries.summaryId, summaryId))
            .limit(1);

          const dbStatus = summaryRecord[0]?.status;
          console.log(`[SSE] Database status: ${dbStatus}`);

          // If summary is already completed/failed, close the stream
          if (dbStatus === "completed" || dbStatus === "failed") {
            console.log(`[SSE] ✓ Summary already ${dbStatus} in DB - closing stream for ${summaryId}`);
            close();
            return;
          }

          // If summary is pending/processing, start polling (wait for stage to be set)
          if (dbStatus === "pending" || dbStatus === "processing") {
            console.log(`[SSE] Summary is ${dbStatus}, starting poll loop...`);
          } else {
            // No record found or unknown status - don't poll forever
            console.log(`[SSE] No valid summary found, closing stream for ${summaryId}`);
            close();
            return;
          }
        }

        // Poll Redis for stage changes every 500ms
        console.log(`[SSE] Starting poll loop for ${summaryId} (500ms interval)`);
        let pollCount = 0;
        pollInterval = setInterval(async () => {
          pollCount++;
          try {
            const redis = getRedis();
            const currentStage = (await redis.get(`summary:${summaryId}:stage`)) as string | null;
            console.log(`[SSE] Poll #${pollCount} for ${summaryId}: currentStage=${currentStage}, lastStage=${lastStage}`);

            // Only send update if stage changed
            if (currentStage !== lastStage) {
              console.log(`[SSE] ✓ STAGE CHANGED for ${summaryId}: ${lastStage} → ${currentStage}`);
              lastStage = currentStage;
              sendEvent({ stage: currentStage });

              // Stop polling if completed
              if (currentStage === "completed") {
                console.log(`[SSE] ✓ COMPLETED - stopping poll for ${summaryId}`);
                if (pollInterval) {
                  clearInterval(pollInterval);
                  pollInterval = null;
                }
                close();
              }
            } else {
              console.log(`[SSE] - No change (stage still: ${currentStage})`);
            }
          } catch (error) {
            console.error(`[SSE] ✗ Error polling Redis for ${summaryId}:`, error);
          }
        }, 500);

        // Send keep-alive every 30 seconds to prevent timeout
        const keepAliveInterval = setInterval(() => {
          sendKeepAlive();
        }, 30000);

        // Cleanup on client disconnect
        event.node.req.on("close", () => {
          console.log(`[SSE] Connection closed for ${summaryId}`);
          if (pollInterval) {
            clearInterval(pollInterval);
          }
          clearInterval(keepAliveInterval);

          close();
        });

        event.node.req.on("error", (error) => {
          console.error(`[SSE] Request error for ${summaryId}:`, error);
        });
      } catch (error) {
        console.error(`[SSE] Error setting up stream for ${summaryId}:`, error);
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
