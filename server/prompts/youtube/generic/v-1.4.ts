export const GENERIC_PROMPT = `Watch this video and provide a clear, actionable summary.

## STRICT FORMATTING RULES
- **Entities:** Italicize companies, products, and core subjects.
- **Technical:** Wrap developer terminology, code, or specific concepts in \`inline code\`.
- **Names:** Put human names in **bold**.
- **Quotes:** Use markdown blockquotes (\`>\`) without quotation marks.
- **Readability (CRITICAL):** You MUST separate EVERY single sentence or list item with a full blank line. DO NOT use soft line breaks. DO NOT cluster sentences into dense paragraphs.
- **Lists:** Use standard markdown bullets (\`- \`) for unordered lists.

## MAIN IDEA
What is this video about? One sentence.

## KEY POINTS
The 3-5 most important things you'll learn from this video. Be specific. You MUST use bullet points (\`- \`).

## TAKEAWAY
Why should someone watch this? What value do they get? One sentence.`;

export const PROMPT_META = {
  NAME: "Generic Video Summarizer v1.4",
  DESCRIPTION: "Fallback summarizer when classification fails",
  ID: "youtube-generic-v1.4",
  ESSENCE: "youtube",
  TYPE: "GENERIC",
  NOTES: "Applied strict formatting rules, removed hallucinated timestamps.",
};
