// Type-specific prompts
export * as tutorial from './tutorial-v1.1';
export * as review from './review-v1.1';
export * as news from './news-v1.1';
export * as opinion from './opinion-v1.1';
export * as interview from './interview-v1.1';
export * as education from './education-v1.1';
export * as light from './light-v1';
export * as generic from './generic-v1';

// Legacy export (remove when old code is migrated)
export { YOUTUBE_PROMPT, PROMPT_META } from './v1';

// Prompt map for easy lookup - returns full module to access PROMPT_META
export const YOUTUBE_PROMPTS = {
  TUTORIAL: () => import('./tutorial-v1.1'),
  REVIEW: () => import('./review-v1.1'),
  NEWS: () => import('./news-v1.1'),
  OPINION: () => import('./opinion-v1.1'),
  INTERVIEW: () => import('./interview-v1.1'),
  EDUCATION: () => import('./education-v1.1'),
  LIGHT: () => import('./light-v1'),
  GENERIC: () => import('./generic-v1'),
} as const;

// Type definitions
export type YouTubeVideoType = keyof typeof YOUTUBE_PROMPTS;
