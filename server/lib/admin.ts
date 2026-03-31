
import type { Article, Summary, YouTube } from "~~/db/schema";

// Base type with common fields
type BaseLlmUsage = {
  summaryId: string;
  essence: "article" | "youtube" | "reddit";
  status: string;
  createdAt: Date;
  summaryModel: string | null;
  summaryPromptId: string | null;
  summaryTimeMs: number | null;
  summaryPromptTokens: number | null;
  summaryCompletionTokens: number | null;
  summaryTotalTokens: number | null;
  holisticTotalTokens: number;
};

// YouTube-specific extension
type YoutubeLlmUsage = BaseLlmUsage & {
  essence: "youtube";
  classifierModel: string | null;
  classifierTimeMs: number | null;
  classifierPromptTokens: number | null;
  classifierCompletionTokens: number | null;
  classifierTotalTokens: number | null;
  transcriptModel: string | null;
  transcriptTimeMs: number | null;
  transcriptPromptTokens: number | null;
  transcriptCompletionTokens: number | null;
  transcriptTotalTokens: number | null;
  totalTimeMs: number | null;
};

// Article-specific extension
type ArticleLlmUsage = BaseLlmUsage & {
  essence: "article";
  classifierModel: string | null;
  classifierTimeMs: number | null;
  classifierPromptTokens: number | null;
  classifierCompletionTokens: number | null;
  classifierTotalTokens: number | null;
  totalTimeMs: number | null;
};

// Fallback for Reddit or missing relations
type FallbackLlmUsage = BaseLlmUsage & {
  essence: "reddit";
};

// The final discriminated union type
export type FlattenedLlmUsage = YoutubeLlmUsage | ArticleLlmUsage | FallbackLlmUsage;


/**
 * Flattens the LLM usage data from a summary and its related entities
 * (Article, YouTube) into a single object for the admin UI.
 *
 * This normalizes the data, so the table can display stats from different
 * sources in a consistent way.
 */
export function flattenLlmUsage(
  summary: Summary,
  youtube: YouTube | null,
  article: Article | null,
): FlattenedLlmUsage {
  // Common fields from the Summary table
  const base = {
    summaryId: summary.summaryId,
    status: summary.status,
    createdAt: summary.createdAt,
    summaryModel: summary.model,
    summaryPromptId: summary.promptId,
    summaryTimeMs: summary.responseTimeMs,
    summaryPromptTokens: summary.promptTokens,
    summaryCompletionTokens: summary.completionTokens,
    summaryTotalTokens: summary.totalTokens,
  };

  if (summary.essence === "youtube" && youtube) {
    const holisticTotalTokens =
      (base.summaryTotalTokens || 0) +
      (youtube.classifierTotalTokens || 0) +
      (youtube.transcriptTotalTokens || 0);

    return {
      ...base,
      essence: "youtube",
      holisticTotalTokens,
      classifierModel: youtube.classifierModel,
      classifierTimeMs: youtube.classifierTimeMs,
      classifierPromptTokens: youtube.classifierPromptTokens,
      classifierCompletionTokens: youtube.classifierCompletionTokens,
      classifierTotalTokens: youtube.classifierTotalTokens,
      transcriptModel: youtube.transcriptModel,
      transcriptTimeMs: youtube.transcriptTimeMs,
      transcriptPromptTokens: youtube.transcriptPromptTokens,
      transcriptCompletionTokens: youtube.transcriptCompletionTokens,
      transcriptTotalTokens: youtube.transcriptTotalTokens,
      totalTimeMs: youtube.totalTimeMs,
    };
  }

  if (summary.essence === "article" && article) {
    const holisticTotalTokens =
      (base.summaryTotalTokens || 0) +
      (article.classifierTotalTokens || 0);

    return {
      ...base,
      essence: "article",
      holisticTotalTokens,
      classifierModel: article.classifierModel,
      classifierTimeMs: article.classifierTimeMs,
      classifierPromptTokens: article.classifierPromptTokens,
      classifierCompletionTokens: article.classifierCompletionTokens,
      classifierTotalTokens: article.classifierTotalTokens,
      totalTimeMs: article.totalTimeMs,
    };
  }

  // Fallback for Reddit or if relations are missing
  return {
    ...base,
    holisticTotalTokens: base.summaryTotalTokens || 0,
    essence: "reddit",
  };
}
