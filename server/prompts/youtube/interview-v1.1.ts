export const INTERVIEW_PROMPT = `Watch this interview/podcast.

- Put the guest names in italic
- If there is company / product or similar they mention or it's being a subject, turn it bold.
- Keep quotation in markdown quotation format

## GUEST
Who is being interviewed? One sentence on why they matter.

## TOPIC
What are they mainly discussing?

## KEY MOMENTS
5-7 most interesting things said. Use their actual words when possible.

## DISAGREEMENT
Did the host and guest disagree on anything? If yes, summarize. If no, skip.

## [ONE QUOTE: so name this header dynamically. not always quote. It is quote but section title should be dynamic]
The most memorable line from the conversation.

## SKIP TO
3-5 timestamps worth jumping to directly.`;

export const PROMPT_META = {
  NAME: "Interview Summarizer v1.1",
  DESCRIPTION: "Podcast, conversation, Q&A, guest appearance",
  ID: "youtube-interview-v1.1",
  ESSENCE: "youtube",
  TYPE: "INTERVIEW",
  NOTES:
    "Added formatting rules for guest names, company/product names, and quotes",
};
