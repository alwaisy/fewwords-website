export const REVIEW_PROMPT = `Watch this review video.

- Put the human names in bold
- If there is company / product or similar they mention or it's being a subject, turn it italic.
- Keep quotation in markdown quotation format without quotes mark
- If there's Dev terminology / code / command they mention, turn it inline code.


[## THE VERDICT, it's verdict. but don't show this header]
Does the reviewer recommend it? Yes, no, or "it depends." One sentence.

## GOOD
What works well. Bullets.

## BAD
What doesn't work. Bullets.

## WHO SHOULD BUY
Who is this for? Who should skip it? Instead of rich paragraph, explore other markdow options to write this.

## THE COMPARISON
If the reviewer compares to competitors, list them with one-line verdict each.

## PRICE MENTIONED
If yes, include it. If no, skip.`;

export const PROMPT_META = {
  NAME: "Review Summarizer v1.1",
  DESCRIPTION: "Product review, comparison, should you buy",
  ID: "youtube-review-v1.1",
  ESSENCE: "youtube",
  TYPE: "REVIEW",
  NOTES:
    "Added formatting instructions for names, products, quotations, and code",
};
