// Article prompts - organized by type (matches YouTube folder structure)
// Each type has its own folder with index.ts (PROMPT_INFO) and v-1.ts (actual prompt)

import * as dataShot from "./data-shot";
import * as decision from "./decision";
import * as structured from "./structured";

// Re-export types and prompts from each folder
export { PROMPT_INFO as STRUCTURED_INFO, PROMPT as STRUCTURED_PROMPT, PROMPT_META as STRUCTURED_META, ARTICLE_PROMPT as STRUCTURED_ARTICLE_PROMPT } from "./structured";
export { PROMPT_INFO as DATA_SHOT_INFO, PROMPT as DATA_SHOT_PROMPT, PROMPT_META as DATA_SHOT_META, ARTICLE_PROMPT as DATA_SHOT_ARTICLE_PROMPT } from "./data-shot";
export { PROMPT_INFO as DECISION_INFO, PROMPT as DECISION_PROMPT, PROMPT_META as DECISION_META, ARTICLE_PROMPT as DECISION_ARTICLE_PROMPT } from "./decision";

// All prompt types
export const ARTICLE_PROMPTS = {
  structured,
  dataShot,
  decision,
} as const;

// Type alias for backward compatibility with classifier
export type PromptCategory = 'v1' | 'v2' | 'v3' | 'reject';

// Map old category names to new folder names
const CATEGORY_MAP: Record<PromptCategory, keyof typeof ARTICLE_PROMPTS | 'reject'> = {
  v1: 'structured',
  v2: 'dataShot',
  v3: 'decision',
  reject: 'reject',
} as const;

// Get prompt by category (backward compatible)
export function getPrompt(category: PromptCategory) {
  if (category === 'reject') return null;
  const folder = CATEGORY_MAP[category] as keyof typeof ARTICLE_PROMPTS;
  return ARTICLE_PROMPTS[folder]?.ARTICLE_PROMPT;
}

// Get meta by category (backward compatible)
export function getPromptMeta(category: PromptCategory) {
  if (category === 'reject') return { ID: 'reject', VERSION: '1.0' };
  const folder = CATEGORY_MAP[category] as keyof typeof ARTICLE_PROMPTS;
  return ARTICLE_PROMPTS[folder]?.PROMPT_META;
}

// Get latest prompt for a category
export function getLatestPrompt(category: PromptCategory) {
  return getPrompt(category);
}

// Get latest meta for a category
export function getLatestPromptMeta(category: PromptCategory) {
  return getPromptMeta(category);
}

// Legacy version mapping for backward compatibility with classifier
export const PROMPT_VERSIONS: Record<PromptCategory, string> = {
  v1: 'v1.3',
  v2: 'v2.5',
  v3: 'v3.4',
  reject: 'reject-v1',
};

// Default export (structured/v1 is the default)
export const ARTICLE_PROMPT = ARTICLE_PROMPTS.structured.ARTICLE_PROMPT;
export const PROMPT_META = ARTICLE_PROMPTS.structured.PROMPT_META;

export type PromptVersion = keyof typeof ARTICLE_PROMPTS;
