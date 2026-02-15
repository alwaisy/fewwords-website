// Type-specific prompts (v2.0 - latest)
export * as tutorial from './tutorial-v2.0';
export * as review from './review-v2.0';
export * as news from './news-v2.0';
export * as opinion from './opinion-v2.0';
export * as interview from './interview-v2.0';
export * as education from './education-v2.0';
export * as light from './light-v2.0';
export * as generic from './generic-v2.0';

// v1.1 exports (kept for fallback/rollback)
export * as tutorial_v1_1 from './tutorial-v1.1';
export * as review_v1_1 from './review-v1.1';
export * as news_v1_1 from './news-v1.1';
export * as opinion_v1_1 from './opinion-v1.1';
export * as interview_v1_1 from './interview-v1.1';
export * as education_v1_1 from './education-v1.1';
export * as light_v1 from './light-v1';
export * as generic_v1 from './generic-v1';

// Legacy export (remove when old code is migrated)
export { YOUTUBE_PROMPT, PROMPT_META } from './v1';

// Prompt map for easy lookup - returns full module to access PROMPT_META
export const YOUTUBE_PROMPTS = {
  TUTORIAL: () => import('./tutorial-v2.0'),
  REVIEW: () => import('./review-v2.0'),
  NEWS: () => import('./news-v2.0'),
  OPINION: () => import('./opinion-v2.0'),
  INTERVIEW: () => import('./interview-v2.0'),
  EDUCATION: () => import('./education-v2.0'),
  LIGHT: () => import('./light-v2.0'),
  GENERIC: () => import('./generic-v2.0'),
} as const;

// Type definitions
export type YouTubeVideoType = keyof typeof YOUTUBE_PROMPTS;
