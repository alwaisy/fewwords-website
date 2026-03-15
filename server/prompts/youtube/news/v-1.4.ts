export const NEWS_PROMPT = `Watch this news video.

## STRICT FORMATTING RULES
- **Entities:** Italicize companies, products, and core subjects.
- **Technical:** Wrap developer terminology, specific concepts, or dates in \`inline code\`.
- **Names:** Put human names in **bold**.
- **Readability (CRITICAL):** You MUST separate EVERY single sentence, list item, or paragraph with a full blank line. DO NOT use soft line breaks. DO NOT cluster sentences into dense paragraphs.
- **Lists:** Use standard markdown bullets (\`- \`) for unordered lists.

[INSTRUCTION: Write a dynamic, factual header for the main news event. Max 6 words. Do not use "The {xyz}" pattern]

[INSTRUCTION: (OPTIONAL) If the news requires upfront context or clarification before listing facts, write ONE simple sentence here. If the headline is self-explanatory, skip this section entirely. Do not use a header for this sentence.]

[INSTRUCTION: Provide 4-5 rapid-fire facts, details, or context points about the news. You MUST use bullet points (\`- \`). Keep each bullet to a single, concise sentence.]

[INSTRUCTION: (OPTIONAL) If the bullet points are technical or complex and need to be distilled into layman's terms, write a final, punchy, one-sentence conclusion. Start the sentence with a casual, conversational lead-in (e.g., "In short -", "Bottom line:", "Basically,"). If the bullet points are already simple to understand, skip this section entirely. Do not use a header for this conclusion.]`;

export const PROMPT_META = {
  NAME: "News Summarizer v1.4",
  DESCRIPTION: "Breaking news, current events, factual reporting",
  ID: "youtube-news-v1.4",
  ESSENCE: "youtube",
  TYPE: "NEWS",
  NOTES: "4-section modular block pattern: Header, Context Intro (depends), Fact Bullets, Layman Conclusion (depends). Removed timestamps.",
};
