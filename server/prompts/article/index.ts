import * as v1 from "./v1";
import * as v1_1 from "./v1.1";
import * as v1_2 from "./v1.2";
import * as v2 from "./v2";
import * as v2_1 from "./v2.1";
import * as v2_3 from "./v2.3";
import * as v2_4 from "./v2.4";
import * as v3 from "./v3";
import * as v3_1 from "./v3.1";
import * as v3_2 from "./v3.2";
import * as v3_3 from "./v3.3";

// All prompt versions
export const ARTICLE_PROMPTS = {
  v1,
  'v1.1': v1_1,
  'v1.2': v1_2,
  v2,
  'v2.1': v2_1,
  'v2.3': v2_3,
  'v2.4': v2_4,
  v3,
  'v3.1': v3_1,
  'v3.2': v3_2,
  'v3.3': v3_3,
} as const;

// Extract latest version for each category (v1, v2, v3)
function getLatestVersions(): Record<'v1' | 'v2' | 'v3', string> {
  const versions = Object.keys(ARTICLE_PROMPTS) as string[];

  const latest = {
    v1: 'v1',
    v2: 'v2',
    v3: 'v3',
  };

  for (const category of ['v1', 'v2', 'v3'] as const) {
    // Find all versions for this category (v1.1, v1.2, etc.)
    const categoryVersions = versions.filter(v => v.startsWith(category + '.'));

    if (categoryVersions.length > 0) {
      // Sort by version number (patch version)
      categoryVersions.sort((a, b) => {
        const aNum = Number.parseInt(a.split('.')[1] || '0', 10);
        const bNum = Number.parseInt(b.split('.')[1] || '0', 10);
        return bNum - aNum; // Descending order
      });

      // First one is the latest
      latest[category] = categoryVersions[0]!;
    }
  }

  return latest;
}

export const PROMPT_VERSIONS = getLatestVersions();

export type PromptCategory = keyof typeof PROMPT_VERSIONS;

// Get prompt by version
export function getPrompt(version: string) {
  return ARTICLE_PROMPTS[version as keyof typeof ARTICLE_PROMPTS]?.ARTICLE_PROMPT;
}

// Get meta by version
export function getPromptMeta(version: string) {
  return ARTICLE_PROMPTS[version as keyof typeof ARTICLE_PROMPTS]?.PROMPT_META;
}

// Get latest prompt for a category
export function getLatestPrompt(category: PromptCategory) {
  const version = PROMPT_VERSIONS[category];
  return getPrompt(version!);
}

// Get latest meta for a category
export function getLatestPromptMeta(category: PromptCategory) {
  const version = PROMPT_VERSIONS[category];
  return getPromptMeta(version!);
}

// Default export (current latest)
export const ARTICLE_PROMPT = ARTICLE_PROMPTS[PROMPT_VERSIONS.v1 as keyof typeof ARTICLE_PROMPTS].ARTICLE_PROMPT;
export const PROMPT_META = ARTICLE_PROMPTS[PROMPT_VERSIONS.v1 as keyof typeof ARTICLE_PROMPTS].PROMPT_META;

export type PromptVersion = keyof typeof ARTICLE_PROMPTS;
