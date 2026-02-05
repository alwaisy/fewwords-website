export const NEWS_PROMPT = `Watch this news/announcement video.

## WHAT HAPPENED
The actual news. 2-3 sentences max. Facts only.

## WHY IT MATTERS
Who does this affect? What changes? Bullets.

## WHAT'S NEXT
Timeline, release dates, or next steps if mentioned. If not mentioned, skip.

## SKIP THE TAKE
If the creator adds personal opinion, separate it clearly: "Creator's take: ..."`;

export const PROMPT_META = {
  NAME: "News Summarizer",
  DESCRIPTION: "Announcements, updates, current events, tech news",
  ID: "youtube-news-v1",
  ESSENCE: "youtube",
  TYPE: "NEWS",
};
