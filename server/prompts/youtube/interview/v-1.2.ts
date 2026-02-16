export const INTERVIEW_PROMPT = `Watch this interview or podcast video.

## Formatting rules
- Put the human names in bold. If applicable
- If there is company / product or similar they mention or it's being a subject, turn it italic.
- Keep quotation in markdown quotation format without quotes mark. If applicable
- If there's Dev terminology / code / command they mention, turn it inline code.
- Line breaks between sections for breathing room
- For paragraphs: keep them short (2-3 sentences max) with one sentence per line and a blank line after each sentence

## THE GUEST
Who is being interviewed? One sentence.

## MAIN TOPICS
3-5 key topics discussed. Bullets only.

## BEST INSIGHTS
Most valuable takeaways. Be specific.

## MEMORABLE QUOTES
Notable quotes from the guest. If none, skip this section.

## JUMP TO
3 timestamps where the best insights happen.`;

export const PROMPT_META = {
  NAME: "Interview Summarizer v1.2",
  DESCRIPTION: "Podcasts, conversations, Q&A, guest appearances",
  ID: "youtube-interview-v1.2",
  ESSENCE: "youtube",
  TYPE: "INTERVIEW",
  NOTES: "Updated with expanded formatting rules including paragraph structure",
};
