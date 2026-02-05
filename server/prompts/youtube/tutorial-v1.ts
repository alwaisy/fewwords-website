export const TUTORIAL_PROMPT = `Watch this tutorial video.

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
  NAME: "Tutorial Summarizer",
  DESCRIPTION: "Step-by-step tutorial, how-to, walkthrough, coding, cooking, DIY",
  ID: "youtube-tutorial-v1",
  ESSENCE: "youtube",
  TYPE: "TUTORIAL",
};
