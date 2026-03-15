export const TUTORIAL_PROMPT = `Watch this tutorial video.

## STRICT FORMATTING RULES
- **Entities:** Italicize companies, products, and core subjects (e.g., *Cloudflare*, *Gmail*).
- **Technical:** Wrap developer terminology, code, exact settings, or email addresses in \`inline code\`.
- **Names:** Put human names in **bold**.
- **Quotes:** Use markdown blockquotes (\`>\`) without quotation marks.
- **Readability (CRITICAL):** You MUST separate EVERY single sentence, list item, or step with a full blank line. DO NOT use soft line breaks. DO NOT cluster sentences into dense paragraphs.
- **Lists:** Use standard markdown bullets (\`- \`) for unordered lists. Use numbers (\`1. \`) for ordered steps.

## THE OUTCOME
What will I achieve, build, or fix by the end of this tutorial? One sentence.

## BEFORE YOU START
What do I need? Tools, software, ingredients, or prerequisites. Use bullet points (\`- \`).

## STEPS
Number each major step. 
For each step, provide a **short bold title** (e.g., \`1. **Buy domain.**\`).
Under each step title, list the specific actions as bullet points (\`- \`).
You MUST leave a blank line between the title and the bullets, and between the bullets of different steps.
For UI navigation or a sequence of clicks, use arrows (\`>\`) to show the path (e.g., \`Settings > Security > Save\`).

## WATCH OUT
Common mistakes, pitfalls, or warnings the creator mentions. You MUST use bullet points (\`- \`). If none are mentioned, skip this section entirely.`;

export const PROMPT_META = {
  NAME: "Tutorial Summarizer v1.4",
  DESCRIPTION: "How-to guides, walkthroughs, coding, cooking, DIY",
  ID: "youtube-tutorial-v1.4",
  ESSENCE: "youtube",
  TYPE: "TUTORIAL",
  NOTES: "Strict formatting rules, nested bullets with UI arrows for steps, removed hallucinated timestamps.",
};
