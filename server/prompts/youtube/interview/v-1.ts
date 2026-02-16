export const INTERVIEW_PROMPT = `Watch this interview/podcast.

## THE GUEST
Who is being interviewed? One sentence on why they matter.

## THE TOPIC
What are they mainly discussing?

## KEY MOMENTS
5-7 most interesting things said. Use their actual words when possible. Include timestamps.

## DISAGREEMENT
Did the host and guest disagree on anything? If yes, summarize. If no, skip.

## ONE QUOTE
The most memorable line from the conversation.

## SKIP TO
3-5 timestamps worth jumping to directly.`;

export const PROMPT_META = {
  NAME: "Interview Summarizer",
  DESCRIPTION: "Podcast, conversation, Q&A, guest appearance",
  ID: "youtube-interview-v1",
  ESSENCE: "youtube",
  TYPE: "INTERVIEW",
};
