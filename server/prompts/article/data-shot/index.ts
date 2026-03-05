// DATA_SHOT prompt - for specs, tutorials, how-tos, buying guides
// Content buried under SEO fluff or backstory
// Reader intent: Extract facts, skip the filler

export const PROMPT_INFO = {
  TYPE: "DATA_SHOT",
  PREVIOUS_NAME: "v2 (V2_DATA_SHOT / No BS Text Shot)",
  MIGRATION: "v2, v2.1, v2.3, v2.4, v2.5 → data-shot/v1.6.ts",
  PURPOSE: "Cut through SEO padding and extract raw data",
  BEST_FOR: [
    "Product specs and buying guides",
    "Tutorials and how-tos",
    "Recipes and step-by-step guides",
    "Content buried under SEO fluff or backstory",
  ],
  READER_INTENT: "Extract facts, skip the filler",
  OUTPUT_STYLE: "Two-section format with Facts and So What",
} as const;

// Latest version export
export { ARTICLE_PROMPT as PROMPT, PROMPT_META } from './v1.6';
export { ARTICLE_PROMPT } from './v1.6';
