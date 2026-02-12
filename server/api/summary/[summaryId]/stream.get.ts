import { getRouterParam } from "h3";

import { redis } from "../../../lib/redis";

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
        controller.enqueue(encoder.encode(message));
      };

      // Helper to send keep-alive comments
      const sendKeepAlive = () => {
        controller.enqueue(encoder.encode(": keep-alive\n\n"));
      };

      try {
        // Send initial stage immediately
        console.log(`[SSE] Fetching initial stage for ${summaryId}...`);
        const initialStage = (await redis.get(`summary:${summaryId}:stage`)) as string | null;
        console.log(`[SSE] Initial stage: ${initialStage}`);
        lastStage = initialStage;
        sendEvent({ stage: initialStage });

        // Stop immediately if already completed
        if (initialStage === "completed") {
          console.log(`[SSE] ✓ Already completed - closing stream for ${summaryId}`);
          controller.close();
          return;
        }

        // Poll Redis for stage changes every 500ms
        console.log(`[SSE] Starting poll loop for ${summaryId} (500ms interval)`);
        let pollCount = 0;
        pollInterval = setInterval(async () => {
          pollCount++;
          try {
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
                controller.close();
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

          try {
            controller.close();
          } catch (error) {
            // Stream might already be closed
            console.error("[SSE] Error closing controller:", error);
          }
        });

        event.node.req.on("error", (error) => {
          console.error(`[SSE] Request error for ${summaryId}:`, error);
        });
      } catch (error) {
        console.error(`[SSE] Error setting up stream for ${summaryId}:`, error);
        controller.error(error);
      }
    },
  });

  return sendStream(event, stream);
});
