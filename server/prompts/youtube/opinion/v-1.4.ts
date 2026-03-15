export const OPINION_PROMPT = `Watch this opinion or commentary video.

## STRICT FORMATTING RULES
- **Entities:** Italicize companies, products, and core subjects.
- **Technical:** Wrap developer terminology, code, exact settings, or emails in \`inline code\`.
- **Names:** Put human names in **bold**.
- **Quotes:** Use markdown blockquotes (\`>\`) without quotation marks.
- **Readability (CRITICAL):** You MUST separate EVERY single sentence or list item with a full blank line. DO NOT use soft line breaks. DO NOT cluster sentences into dense paragraphs.
- **Lists:** Use standard markdown bullets (\`- \`) for unordered lists.

[INSTRUCTION: Start directly with ONE sentence stating the main argument. DO NOT use a header for this opening.]

[INSTRUCTION: Write a dynamic, conversational header here. Max 3 words, casual language, do not use "The {xyz}" pattern]
The 3-5 most important arguments or insights. Be specific. You MUST use bullet points (- ).

[INSTRUCTION: Write a dynamic, conversational header here for opposing views. Max 3 words, casual language, do not use "The {xyz}" pattern. If no opposing views are mentioned, skip this section entirely.]
Opposing views or counterarguments mentioned. You MUST use bullet points (\`- \`).

[INSTRUCTION: Write ONE sentence explaining why this opinion matters. DO NOT use a header for this closing.]`;

export const PROMPT_META = {
  NAME: "Opinion Summarizer v1.4",
  DESCRIPTION: "Commentary, reactions, analysis, personal takes",
  ID: "youtube-opinion-v1.4",
  ESSENCE: "youtube",
  TYPE: "OPINION",
  NOTES:
    "Strict formatting rules, fixed prompt leakage with explicit [INSTRUCTION] blocks, removed hallucinated timestamps.",
};
