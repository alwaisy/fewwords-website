// STRUCTURED prompt - for essays, research, opinion, analysis
// Content where "why" matters as much as "what"
// Reader intent: Learn, understand context

export const PROMPT_INFO = {
  TYPE: "STRUCTURED",
  PREVIOUS_NAME: "v1 (V1_STRUCTURED)",
  MIGRATION: "v1, v1.1, v1.2, v1.3 → structured/v1.4.ts",
  PURPOSE: "Long-form content summarization with context and nuance",
  BEST_FOR: [
    "Essays and research papers",
    "Opinion pieces and editorials",
    "Analysis and deep dives",
    "Content where 'why' matters as much as 'what'",
  ],
  READER_INTENT: "Learn, understand context",
  OUTPUT_STYLE: "Structured with Main Idea, dynamic body, Context, Takeaway",
} as const;

// Latest version export
export { ARTICLE_PROMPT as PROMPT, PROMPT_META } from './v1.4';
export { ARTICLE_PROMPT } from './v1.4';
