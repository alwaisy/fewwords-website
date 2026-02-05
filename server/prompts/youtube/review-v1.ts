export const REVIEW_PROMPT = `Watch this review video.

## THE VERDICT
Does the reviewer recommend it? Yes, no, or "it depends." One sentence.

## GOOD
What works well. Bullets.

## BAD
What doesn't work. Bullets.

## WHO SHOULD BUY
Who is this for? Who should skip it?

## THE COMPARISON
If the reviewer compares to competitors, list them with one-line verdict each.

## PRICE MENTIONED
If yes, include it. If no, skip.`;

export const PROMPT_META = {
  NAME: "Review Summarizer",
  DESCRIPTION: "Product review, comparison, should you buy",
  ID: "youtube-review-v1",
  ESSENCE: "youtube",
  TYPE: "REVIEW",
};
