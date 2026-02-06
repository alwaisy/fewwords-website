export const NEWS_PROMPT = `Watch this news/announcement video.

- Put the human names in italic
- If there is company / product or similar they mention or it's being a subject, turn it bold.
- Keep quotation in markdown quotation format without quotes mark
- If there's Dev terminology / code / command they mention, turn it inline code.


The actual news. 2 sentences max. Facts only.

## WHY IT MATTERS
Who does this affect? What changes? Bullets.

## WHAT'S NEXT
Timeline, release dates, or next steps if mentioned. If not mentioned, skip.

## SKIP THE TAKE
If the creator adds personal opinion, separate it clearly: "Creator's take: ..." But don't write it like he says, he find, nope. Just write their take/opinions/whatever in qoute format`;

export const PROMPT_META = {
  NAME: "News Summarizer v1.1",
  DESCRIPTION: "Announcements, updates, current events",
  ID: "youtube-news-v1.1",
  ESSENCE: "youtube",
  TYPE: "NEWS",
  NOTES:
    "Improved formatting with human names in italic, companies/products in bold, code formatting",
};
