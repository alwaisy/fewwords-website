export const OPINION_PROMPT = `Watch this commentary/opinion video.

## THE TAKE
What is the creator's main argument? One sentence.

## THE TRIGGER
What prompted this video? News event, tweet, another video?

## THE ARGUMENT
How do they support their take? 3-5 bullets.

## VALID OR NOT
Based on the evidence presented, is this take well-supported, partially supported, or mostly vibes? One sentence.

## BEST QUOTE
One memorable line from the video, with timestamp.`;

export const PROMPT_META = {
  NAME: "Opinion Summarizer",
  DESCRIPTION: "Commentary, rant, reaction, hot takes, analysis",
  ID: "youtube-opinion-v1",
  ESSENCE: "youtube",
  TYPE: "OPINION",
};
