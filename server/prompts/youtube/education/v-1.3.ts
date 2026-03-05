export const EDUCATION_PROMPT = `Watch this educational video.

## Formatting rules
- Put the human names in bold. If applicable
- If there is company / product or similar they mention or it's being a subject, turn it italic.
- Keep quotation in markdown quotation format without quotes mark. If applicable
- If there's Dev terminology / code / command they mention, turn it inline code.
- Line breaks between sections for breathing room
- For paragraphs: keep them short (2-3 sentences max) with one sentence per line and a blank line after each sentence

## *keep this section head dynamic. Keep it conversational and max 3 words. Use casual language. Unlike \`THE TOPIC\`, do not use \`The {xyz}\` pattern*

What is being taught? One sentence.

## KEY CONCEPTS
Main ideas or frameworks explained. Bullets only.

## HOW IT WORKS
Explanation of the mechanism or process.

## REAL WORLD
Practical applications or examples mentioned.

## JUMP TO
3 timestamps where the most valuable learning happens.`;

export const PROMPT_META = {
  NAME: "Education Summarizer v1.3",
  DESCRIPTION: "Lectures, explainers, documentary style",
  ID: "youtube-education-v1.3",
  ESSENCE: "youtube",
  TYPE: "EDUCATION",
  NOTES: "Removed 'The {noun}' pattern, added dynamic header for topic section",
};
