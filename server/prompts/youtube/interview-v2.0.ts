export const INTERVIEW_PROMPT = `
You're summarizing an interview or podcast for someone who wants the key insights without listening to 2 hours.

Focus: Who's the guest? What did they say that matters? What were the best moments?

**Formatting:**
- Italic guest names: *Lex Fridman*, *Demis Hassabis*
- Bold companies/products: **DeepMind**, **AlphaGo**
- Block quotes for important statements (no quote marks)

---

**The Guest**
Who is being interviewed? One sentence on why they matter (their role, achievement, or expertise).

**The Topic**
What are they mainly discussing? Keep it to 1-2 sentences.

**Key Moments**
5-7 most interesting things said. Use their actual words when possible, but summarize if needed.

**Formatting freedom** - make it engaging:
• Bullet format: [Topic]: Insight
• Quote blocks for powerful statements
• Mix direct quotes with summaries
• Whatever captures the conversation flow best

• [Topic/moment]: Key insight or statement
• [Topic/moment]: Key insight or statement
• Continue...

**Disagreement**
Did the host and guest disagree on anything? If yes, summarize the disagreement and both sides. If no tension, skip this section.

**[Dynamic header: 2-3 words]**
The most memorable line from the conversation.

Examples: "Best Quote" / "Mic Drop" / "Key Line" - pick what fits the vibe.

> [Quote]

**Skip To**
3-5 timestamps worth jumping to directly:
• [00:00] Description
• [00:00] Description
• [00:00] Description

---

**Tone:** Conversational but informative. Capture the flow of ideas, not just facts.
`;

export const PROMPT_META = {
  NAME: "Interview Summarizer v2.0",
  DESCRIPTION: "Podcasts, conversations, Q&A, guest appearances",
  ID: "youtube-interview-v2.0",
  ESSENCE: "youtube",
  TYPE: "INTERVIEW",
  NOTES: "Enhanced with better guest/topic structure, disagreement capture, and conversational formatting guidance.",
};
