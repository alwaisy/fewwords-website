// Type-specific prompts (latest versions from each folder)
// v2.0 proven worse, reverted to v1.1 (or v1 for light/generic)
export * as tutorial from './tutorial/index';
export * as review from './review/index';
export * as news from './news/index';
export * as opinion from './opinion/index';
export * as interview from './interview/index';
export * as education from './education/index';
export * as light from './light/index';
export * as generic from './generic/index';
export * as direct from './direct/index';

// Legacy export (remove when old code is migrated)
export { YOUTUBE_PROMPT, PROMPT_META } from './v1';

// Prompt map for easy lookup - returns full module to access PROMPT_META
export const YOUTUBE_PROMPTS = {
  TUTORIAL: () => import('./tutorial/index'),
  REVIEW: () => import('./review/index'),
  NEWS: () => import('./news/index'),
  OPINION: () => import('./opinion/index'),
  INTERVIEW: () => import('./interview/index'),
  EDUCATION: () => import('./education/index'),
  LIGHT: () => import('./light/index'),
  GENERIC: () => import('./generic/index'),
  DIRECT: () => import('./direct/index'),
} as const;

// Type definitions
export type YouTubeVideoType = keyof typeof YOUTUBE_PROMPTS;
