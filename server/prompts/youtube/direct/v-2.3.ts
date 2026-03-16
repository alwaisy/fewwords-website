export const DIRECT_PROMPT = \`Watch this short video (5-20 minutes) and provide an accurate, high-fidelity summary.

## STRICT FORMATTING RULES
- **Entities:** Italicize companies, products, and core subjects (e.g., *Argentina*, *Cloudflare*, *Gmail*).
- **Technical:** Wrap specific terms, numbers, or technical concepts in \\\`inline code\\\`.
- **Names:** Put human names in **bold**.
- **Quotes:** Use markdown blockquotes (\\\`> \\\`) without quotation marks.
- **Readability (CRITICAL):** You MUST separate EVERY single sentence, list item, or step with a full blank line. DO NOT use soft line breaks. DO NOT cluster sentences into dense paragraphs.
- **Lists:** Use standard markdown bullets (\\\`- \\\`) for unordered lists.

[INSTRUCTION: Start directly with 1-2 sentences stating the core message, news, or tension of the video. DO NOT use a header for this opening.]

[INSTRUCTION: Write a dynamic, conversational H2 (##) header for the primary focus of the video. Max 3 words, casual language, do not use "The {xyz}" pattern]
Summarize the main content here. Be specific with details, numbers, and arguments. You MUST use bullet points (\\\`- \\\`) for listing related points. 

[INSTRUCTION: Write a dynamic, conversational H2 (##) header for any secondary insights, context, or alternatives mentioned. Max 3 words, casual language, do not use "The {xyz}" pattern. Skip if not applicable.]
Provide additional context or alternatives here. Use bullet points (\\\`- \\\`) as needed.

[INSTRUCTION: Write a dynamic, conversational H2 (##) header for the final takeaway. Max 3 words, casual language, do not use "The {xyz}" pattern]
What is the core conclusion or actionable step? One to two sentences.

## LENGTH
- 150-200 words total.
- Quality over brevity, but cut ruthlessly.
- Every sentence must teach something new.

## WHAT TO CUT
- Video meta-commentary ("In this video...", "The creator explains...").
- Intro/outro fluff, CTAs, subscribe requests.
- Repetition.
- Personal anecdotes unless they demonstrate the point clearly.

## WHAT TO KEEP
- Core concepts and how they work.
- Specific examples, numbers, research.
- Framework names and steps.
- The practical application.
\`;

export const PROMPT_META = {
  NAME: "Direct/Short Video Summarizer v2.3",
  DESCRIPTION: "5-20 minute videos with balanced editorial focus and strict formatting.",
  ID: "youtube-direct-v2.3",
  ESSENCE: "youtube",
  TYPE: "DIRECT",
  NOTES: "Upgraded to 1.4 formatting standard, removed Teacher/Friend persona to prevent topic hijacking, added dynamic header brackets.",
};
