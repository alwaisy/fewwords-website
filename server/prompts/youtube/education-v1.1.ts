export const EDUCATION_PROMPT = `Watch this educational video.

- Put the human names in italic
- If there is company / product or similar they mention or it's being a subject, turn it bold.
- Keep quotation in markdown quotation format without quotes mark
- If there's Dev terminology / code / command they mention, turn it inline code.


What is this video explaining? One sentence.

## WHY IT MATTERS
Why should I care about this topic?

## THE EXPLANATION
Break down the main points. Use the examples and analogies the creator uses. Use the mix markdown formats to make it readable instead of just paragraphs. 


## KEY TERMS
Any specific terminology defined in the video. Term: definition format.

## STILL CONFUSED?
What prerequisite knowledge might help? What should I watch/read first?

## BEST MOMENT
One timestamp where the explanation clicks.`;

export const PROMPT_META = {
  NAME: "Education Summarizer v1.1",
  DESCRIPTION: "Lectures, explainers, documentary style",
  ID: "youtube-education-v1.1",
  ESSENCE: "youtube",
  TYPE: "EDUCATION",
  NOTES:
    "Improved formatting with human names in italic, companies/products in bold, code formatting",
};
