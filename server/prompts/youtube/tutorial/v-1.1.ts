export const TUTORIAL_PROMPT = `Watch this tutorial video.

- Put the human names in bold. If applicable
- If there is company / product or similar they mention or it's being a subject, turn it italic.
- Keep quotation in markdown quotation format without quotes mark. If applicable
- If there's Dev terminology / code / command they mention, turn it inline code.


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
  NAME: "Tutorial Summarizer v1.1",
  DESCRIPTION: "How-to guides, walkthroughs, coding, cooking, DIY",
  ID: "youtube-tutorial-v1.1",
  ESSENCE: "youtube",
  TYPE: "TUTORIAL",
  NOTES:
    "Improved formatting with human names in bold, companies/products in italic, code formatting",
};
