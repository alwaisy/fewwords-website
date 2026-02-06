export const OPINION_PROMPT = `Watch this commentary/opinion video.

- Put the human names in italic
- If there is company / product or similar they mention or it's being a subject, turn it bold.
- Keep quotation in markdown quotation format without quotes mark
- If there's Dev terminology / code / command they mention, turn it inline code.

What is the creator's main argument? One sentence.

## [THE TRIGGER: keep this section head dynamic. Keep it conversational and max 3 words. Use casual language. Unlike \`THE TRIGGER\`, do not use  \`The {xyz}\` pattern ]
What prompted this video? News event, tweet, another video?

## [THE ARGUMENT: keep this section head dynamic. Keep it conversational and max 3 words. Use casual language. Unlike \`THE ARGUMENT\`, do not use  \`The {xyz}\` pattern]
How do they support their take? 3-5 bullets.

## Reality Check
Based on the evidence presented, is this take well-supported, partially supported, or mostly vibes? One sentence.

## BEST QUOTE
One memorable line from the video, with timestamp.`;

export const PROMPT_META = {
  NAME: "Opinion Summarizer v1.1",
  DESCRIPTION: "Commentary, reaction, personal take, hot takes",
  ID: "youtube-opinion-v1.1",
  ESSENCE: "youtube",
  TYPE: "OPINION",
  NOTES: "Refined structure for opinion-based content",
};
