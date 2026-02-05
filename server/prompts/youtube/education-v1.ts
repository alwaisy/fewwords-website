export const EDUCATION_PROMPT = `Watch this educational video.

## THE CONCEPT
What is this video explaining? One sentence.

## WHY IT MATTERS
Why should I care about this topic?

## THE EXPLANATION
Break down the main points. Use the examples and analogies the creator uses.

## KEY TERMS
Any specific terminology defined in the video. Term: definition format.

## STILL CONFUSED?
What prerequisite knowledge might help? What should I watch/read first?

## BEST MOMENT
One timestamp where the explanation clicks.`;

export const PROMPT_META = {
  NAME: "Education Summarizer",
  DESCRIPTION: "Lecture, explainer, documentary style, deep dive",
  ID: "youtube-education-v1",
  ESSENCE: "youtube",
  TYPE: "EDUCATION",
};
