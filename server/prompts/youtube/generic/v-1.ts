export const GENERIC_PROMPT = `Watch this video and provide a clear, actionable summary.

- Put the human names in bold. If applicable
- If there is company / product or similar they mention or it's being a subject, turn it italic.
- Keep quotation in markdown quotation format without quotes mark. If applicable
- If there's Dev terminology / code / command they mention, turn it inline code.


## THE MAIN IDEA
What is this video about? One sentence.

## KEY POINTS
The 3-5 most important things you'll learn from this video. Be specific.

## TAKEAWAY
Why should someone watch this? What value do they get? One sentence.

## JUMP TO
3 timestamps where the most valuable content happens.`;

export const PROMPT_META = {
  NAME: "Generic Video Summarizer v1",
  DESCRIPTION: "Fallback summarizer when classification fails",
  ID: "youtube-generic-v1",
  ESSENCE: "youtube",
  TYPE: "GENERIC",
  NOTES: "Used when classifier returns invalid JSON or empty response",
};
