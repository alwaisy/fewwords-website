
import type { Article, Summary, YouTube } from "~~/database/orm/schema";

function countWords(text: string | null): number | null {
  if (!text) return null;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export type FlattenedLlmUsage = {
  summaryId: string;
  summary: string | null;
  essence: "article" | "youtube" | "reddit";
  status: string;
  createdAt: Date;
  summaryModel: string | null;
  summaryPromptId: string | null;
  summaryTimeMs: number | null;
  actualSummarizationTimeMs: number | null;
  summaryPromptTokens: number | null;
  summaryCompletionTokens: number | null;
  summaryTotalTokens: number | null;
  holisticTotalTokens: number;
  // Classifier stage (article + youtube)
  classifierModel: string | null;
  classifierTimeMs: number | null;
  classifierPromptTokens: number | null;
  classifierCompletionTokens: number | null;
  classifierTotalTokens: number | null;
  // Transcript stage (youtube only)
  transcriptModel: string | null;
  transcriptTimeMs: number | null;
  transcriptPromptTokens: number | null;
  transcriptCompletionTokens: number | null;
  transcriptTotalTokens: number | null;
  // Output word count
  wordCount: number | null;
  // Total cycle time
  totalTimeMs: number | null;
};


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
  const base: FlattenedLlmUsage = {
    summaryId: summary.summaryId,
    summary: summary.summary,
    essence: summary.essence,
    status: summary.status,
    createdAt: summary.createdAt,
    summaryModel: summary.model,
    summaryPromptId: summary.promptId,
    summaryTimeMs: summary.responseTimeMs,
    summaryPromptTokens: summary.promptTokens,
    summaryCompletionTokens: summary.completionTokens,
    summaryTotalTokens: summary.totalTokens,
    holisticTotalTokens: 0,
    classifierModel: null,
    classifierTimeMs: null,
    classifierPromptTokens: null,
    classifierCompletionTokens: null,
    classifierTotalTokens: null,
    transcriptModel: null,
    transcriptTimeMs: null,
    transcriptPromptTokens: null,
    transcriptCompletionTokens: null,
    transcriptTotalTokens: null,
    wordCount: countWords(summary.summary),
    totalTimeMs: null,
    actualSummarizationTimeMs: summary.responseTimeMs, // Default to responseTimeMs
  };

  if (summary.essence === "youtube" && youtube) {
    base.holisticTotalTokens =
      (base.summaryTotalTokens || 0) +
      (youtube.classifierTotalTokens || 0) +
      (youtube.transcriptTotalTokens || 0);
    
    // Calculate actual summarization time by subtracting known stages
    if (summary.responseTimeMs) {
      base.actualSummarizationTimeMs = summary.responseTimeMs - (youtube.classifierTimeMs || 0) - (youtube.transcriptTimeMs || 0);
    }

    base.classifierModel = youtube.classifierModel;
    base.classifierTimeMs = youtube.classifierTimeMs;
    base.classifierPromptTokens = youtube.classifierPromptTokens;
    base.classifierCompletionTokens = youtube.classifierCompletionTokens;
    base.classifierTotalTokens = youtube.classifierTotalTokens;
    base.transcriptModel = youtube.transcriptModel;
    base.transcriptTimeMs = youtube.transcriptTimeMs;
    base.transcriptPromptTokens = youtube.transcriptPromptTokens;
    base.transcriptCompletionTokens = youtube.transcriptCompletionTokens;
    base.transcriptTotalTokens = youtube.transcriptTotalTokens;
    base.totalTimeMs = youtube.totalTimeMs;
    return base;
  }

  if (summary.essence === "article" && article) {
    base.holisticTotalTokens =
      (base.summaryTotalTokens || 0) +
      (article.classifierTotalTokens || 0);

    // Calculate actual summarization time by subtracting known stages
    if (summary.responseTimeMs) {
      base.actualSummarizationTimeMs = summary.responseTimeMs - (article.classifierTimeMs || 0);
    }

    base.classifierModel = article.classifierModel;
    base.classifierTimeMs = article.classifierTimeMs;
    base.classifierPromptTokens = article.classifierPromptTokens;
    base.classifierCompletionTokens = article.classifierCompletionTokens;
    base.classifierTotalTokens = article.classifierTotalTokens;
    base.totalTimeMs = article.totalTimeMs;
    return base;
  }

  // Fallback for Reddit or if relations are missing
  base.holisticTotalTokens = base.summaryTotalTokens || 0;
  return base;
}
