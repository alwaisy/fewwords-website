export const OPINION_PROMPT = `Watch this opinion or commentary video.

## Formatting rules
- Put the human names in bold. If applicable
- If there is company / product or similar they mention or it's being a subject, turn it italic.
- Keep quotation in markdown quotation format without quotes mark. If applicable
- If there's Dev terminology / code / command they mention, turn it inline code.
- Line breaks between sections for breathing room
- For paragraphs(if applicable): keep them short (2-3 sentences max) with one sentence per line and a blank line after each sentence


Opening (no header)
What's the main argument? One sentence.

## [keep this section head dynamic. Keep it conversational and max 3 words. Use casual language. Unlike \`THE TAKE\`, do not use \`The {xyz}\` pattern]
The 3-5 most important arguments or insights. Be specific. Make bullet points.

## [keep this section head dynamic. Keep it conversational and max 3 words. Use casual language. Unlike \`THE TAKE\`, do not use \`The {xyz}\` pattern]
Opposing views or counterarguments mentioned. If none, skip.

Closing (no header)
Why does this opinion matter? One sentence.

## JUMP TO
3 timestamps where the most valuable insights happen.`;

export const PROMPT_META = {
  NAME: "Opinion Summarizer v1.3",
  DESCRIPTION: "Commentary, reactions, analysis, personal takes",
  ID: "youtube-opinion-v1.3",
  ESSENCE: "youtube",
  TYPE: "OPINION",
  NOTES:
    "Removed 'The {noun}' pattern, added dynamic headers for context-aware sections",
};
