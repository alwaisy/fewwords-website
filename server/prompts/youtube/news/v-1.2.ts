export const NEWS_PROMPT = `Watch this news video.

## Formatting rules
- Put the human names in bold. If applicable
- If there is company / product or similar they mention or it's being a subject, turn it italic.
- Keep quotation in markdown quotation format without quotes mark. If applicable
- If there's Dev terminology / code / command they mention, turn it inline code.
- Line breaks between sections for breathing room
- For paragraphs: keep them short (2-3 sentences max) with one sentence per line and a blank line after each sentence

## THE STORY
What happened? One sentence.

## KEY FACTS
The 3-5 most important facts. Bullets only.

## CONTEXT
Background info to understand this story.

## WHAT'S NEXT
What to expect or what actions to take. One sentence.

## JUMP TO
3 timestamps where the most important information happens.`;

export const PROMPT_META = {
  NAME: "News Summarizer v1.2",
  DESCRIPTION: "Breaking news, current events, factual reporting",
  ID: "youtube-news-v1.2",
  ESSENCE: "youtube",
  TYPE: "NEWS",
  NOTES: "Updated with expanded formatting rules including paragraph structure",
};
