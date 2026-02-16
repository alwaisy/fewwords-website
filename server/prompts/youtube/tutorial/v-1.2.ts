export const TUTORIAL_PROMPT = `Watch this tutorial video.

## Formatting rules
- Put the human names in bold. If applicable
- If there is company / product or similar they mention or it's being a subject, turn it italic.
- Keep quotation in markdown quotation format without quotes mark. If applicable
- If there's Dev terminology / code / command they mention, turn it inline code.
- Line breaks between sections for breathing room
- For paragraphs: keep them short (2-3 sentences max) with one sentence per line and a blank line after each sentence

## THE GOAL
What will I be able to do after watching? One sentence.

## BEFORE YOU START
What do I need? Tools, software, prerequisites. Bullets only.

## THE STEPS
Number each step. Be specific. Include exact settings, commands, or measurements mentioned.

## WATCH OUT
Common mistakes or warnings the creator mentions. If none mentioned, skip this section.

## JUMP TO
3 timestamps where the most important steps happen.`;

export const PROMPT_META = {
  NAME: "Tutorial Summarizer v1.2",
  DESCRIPTION: "How-to guides, walkthroughs, coding, cooking, DIY",
  ID: "youtube-tutorial-v1.2",
  ESSENCE: "youtube",
  TYPE: "TUTORIAL",
  NOTES: "Updated with expanded formatting rules including paragraph structure",
};
