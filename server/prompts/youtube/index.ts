// Type-specific prompts
export * as tutorial from './tutorial-v1';
export * as review from './review-v1';
export * as news from './news-v1';
export * as opinion from './opinion-v1.1';
export * as interview from './interview-v1.1';
export * as education from './education-v1';
export * as light from './light-v1';

// Legacy export (remove when old code is migrated)
export { YOUTUBE_PROMPT, PROMPT_META } from './v1';

// Prompt map for easy lookup
export const YOUTUBE_PROMPTS = {
  TUTORIAL: () => import('./tutorial-v1').then(m => m.TUTORIAL_PROMPT),
  REVIEW: () => import('./review-v1').then(m => m.REVIEW_PROMPT),
  NEWS: () => import('./news-v1').then(m => m.NEWS_PROMPT),
  OPINION: () => import('./opinion-v1.1').then(m => m.OPINION_PROMPT),
  INTERVIEW: () => import('./interview-v1.1').then(m => m.INTERVIEW_PROMPT),
  EDUCATION: () => import('./education-v1').then(m => m.EDUCATION_PROMPT),
  LIGHT: () => import('./light-v1').then(m => m.LIGHT_PROMPT),
} as const;

// Type definitions
export type YouTubeVideoType = keyof typeof YOUTUBE_PROMPTS;
