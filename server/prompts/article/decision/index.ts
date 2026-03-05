// DECISION prompt - for news, announcements, time-sensitive content
// Content where reader asks "should I care about this?"
// Reader intent: Decide quickly, take action

export const PROMPT_INFO = {
  TYPE: "DECISION",
  PREVIOUS_NAME: "v3 (V3_DECISION_BRIEF / Aggressive Decision Brief)",
  MIGRATION: "v3, v3.1, v3.2, v3.3, v3.4 → decision/v-1.ts",
  PURPOSE: "Help reader make quick decisions on time-sensitive content",
  BEST_FOR: [
    "News and market updates",
    "Announcements and product launches",
    "Time-sensitive content",
    "Content where reader asks 'should I care?'",
  ],
  READER_INTENT: "Decide quickly, take action",
  OUTPUT_STYLE: "Aggressive 200-word brief with Final Take",
} as const;

// Latest version export
export { ARTICLE_PROMPT as PROMPT, PROMPT_META } from './v-1';
export { ARTICLE_PROMPT } from './v-1';
