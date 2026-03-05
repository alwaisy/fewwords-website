export const GENERIC_PROMPT = `Watch this video and provide a clear, actionable summary.

## Formatting rules
- Put the human names in bold. If applicable
- If there is company / product or similar they mention or it's being a subject, turn it italic.
- Keep quotation in markdown quotation format without quotes mark. If applicable
- If there's Dev terminology / code / command they mention, turn it inline code.
- Line breaks between sections for breathing room
- For paragraphs: keep them short (2-3 sentences max) with one sentence per line and a blank line after each sentence

## MAIN IDEA
What is this video about? One sentence.

## KEY POINTS
The 3-5 most important things you'll learn from this video. Be specific.

## TAKEAWAY
Why should someone watch this? What value do they get? One sentence.

## JUMP TO
3 timestamps where the most valuable content happens.`;

export const PROMPT_META = {
  NAME: "Generic Video Summarizer v1.3",
  DESCRIPTION: "Fallback summarizer when classification fails",
  ID: "youtube-generic-v1.3",
  ESSENCE: "youtube",
  TYPE: "GENERIC",
  NOTES: "Removed 'The {noun}' pattern - MAIN IDEA instead of THE MAIN IDEA",
};
