export const REVIEW_PROMPT = `Watch this product review video.

## Formatting rules
- Put the human names in bold. If applicable
- If there is company / product or similar they mention or it's being a subject, turn it italic.
- Keep quotation in markdown quotation format without quotes mark. If applicable
- If there's Dev terminology / code / command they mention, turn it inline code.
- Line breaks between sections for breathing room
- For paragraphs: keep them short (2-3 sentences max) with one sentence per line and a blank line after each sentence

## THE VERDICT
Buy or don't buy? One sentence.

## THE GOOD
What works well. Be specific.

## THE BAD
What doesn't work. Be specific.

## WHO SHOULD BUY
Who is this for? Be specific.

## THE ALTERNATIVE
If mentioned, what else could you buy instead?

## JUMP TO
3 timestamps where the most valuable insights happen.`;

export const PROMPT_META = {
  NAME: "Review Summarizer v1.2",
  DESCRIPTION: "Product evaluations, comparisons, tech reviews",
  ID: "youtube-review-v1.2",
  ESSENCE: "youtube",
  TYPE: "REVIEW",
  NOTES: "Updated with expanded formatting rules including paragraph structure",
};
