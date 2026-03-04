import youtubeSummaryQueue from "../../queues/youtube-summary";
import { fetchYouTubeMetadata } from "../../services/youtube/metadata";

import { summaries } from "~~/db/schema";

export default defineEventHandler(async (event) => {
  const db = await useDb(event);
  const session = await getUserSession(event);
  const userId = session?.user ? (session.user as { id: string }).id : null;

  try {
    const body = await readBody(event);
    const { url } = body;

    if (!url) {
      throw createError({
        statusCode: 400,
        statusMessage: "URL is required",
      });
    }

    // Detect content type
    function detectContentType(
      url: string,
    ): "article" | "youtube" | "reddit" {
      const urlObj = new URL(url);

      if (
        urlObj.hostname.includes("youtube.com") ||
        urlObj.hostname.includes("youtu.be")
      ) {
        return "youtube";
      }

      if (urlObj.hostname.includes("reddit.com")) {
        return "reddit";
      }

      return "article";
    }

    const essence = detectContentType(url);

    // ═══════════════════════════════════════════════════════════
    // YOUTUBE: Fetch metadata FIRST to make routing decision
    // ═══════════════════════════════════════════════════════════
    if (essence === "youtube") {
      const config = useRuntimeConfig();
      const { video } = await fetchYouTubeMetadata(
        url,
        config.private.youtubeDataApiKey!,
      );
      const duration = video.durationMinutes;

      // Error cases (match exact error messages from service layer)
      if (video.isLive) {
        throw createError({
          statusCode: 422,
          statusMessage:
            "Live streams aren't supported yet. Wait for the stream to end and try again.",
        });
      }
      if (duration <= 5) {
        throw createError({
          statusCode: 422,
          statusMessage:
            "Videos under 5 minutes are too brief to summarize meaningfully. Try a longer video.",
        });
      }
      if (duration > 180) {
        throw createError({
          statusCode: 422,
          statusMessage:
            "Videos over 3 hours exceed the maximum supported length. Try a shorter video.",
        });
      }

      // ═══════════════════════════════════════════════════════
      // FLOW 3: Background Job (21-180min)
      // ═══════════════════════════════════════════════════════
      if (duration > 20) {
        if (!userId) {
          throw createError({
            statusCode: 401,
            statusMessage:
              "Sign in to summarize videos longer than 20 minutes.",
          });
        }

        const userEmail =
          (session?.user as { email?: string } | undefined)?.email ?? "";

        // Create with CORRECT status from start - NEVER "pending"
        // This prevents startProcessing() from ever firing on page load
        const insertResult = await db
          .insert(summaries)
          .values({
            source: url,
            essence: "youtube",
            status: "processing", // CRITICAL: NOT "pending"
            isBackgroundJob: true, // CRITICAL: Set immediately
            summary: "",
            userId,
          })
          .returning({ summaryId: summaries.summaryId });

        const summaryId = insertResult[0]?.summaryId;

        if (!summaryId) {
          throw createError({
            statusCode: 500,
            statusMessage: "Failed to create summary record",
          });
        }

        // Enqueue AFTER record created with correct status
        await youtubeSummaryQueue.add("youtube-summary", {
          summaryId,
          url,
          notifyEmail: userEmail,
        });

        console.log(
          `[create-pending] Background job enqueued for ${summaryId} (${duration}min)`,
        );

        return { summaryId };
      }

      // ═══════════════════════════════════════════════════════
      // FLOW 2: Sync YouTube (≤20min)
      // ═══════════════════════════════════════════════════════
      const insertResult = await db
        .insert(summaries)
        .values({
          source: url,
          essence: "youtube",
          status: "pending", // OK for sync - startProcessing() will fire
          isBackgroundJob: false,
          summary: "",
          userId,
        })
        .returning({ summaryId: summaries.summaryId });

      const summaryId = insertResult[0]?.summaryId;

      if (!summaryId) {
        throw createError({
          statusCode: 500,
          statusMessage: "Failed to create summary record",
        });
      }

      return { summaryId };
    }

    // ═══════════════════════════════════════════════════════
    // FLOW 1: Article/Reddit (sync)
    // ═══════════════════════════════════════════════════════
    const insertResult = await db
      .insert(summaries)
      .values({
        source: url,
        essence,
        status: "pending",
        isBackgroundJob: false,
        summary: "",
        userId,
      })
      .returning({ summaryId: summaries.summaryId });

    const summaryId = insertResult[0]?.summaryId;

    if (!summaryId) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to create summary record",
      });
    }

    return { summaryId };
  } catch (error: unknown) {
    console.error("Create pending API error:", error);

    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to create pending record",
    });
  }
});
