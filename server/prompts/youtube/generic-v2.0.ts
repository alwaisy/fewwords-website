export const GENERIC_PROMPT = `
You're summarizing a video that doesn't fit neatly into tutorial, review, news, interview, or education categories.

Focus: What's the main point? What should someone remember? What value does it offer?

**Formatting:**
- Bold human names: **Name**
- Italic products/companies: *Product*, *Company*
- Block quotes for important statements (no quote marks)
- Inline code for technical terms: \`command\`, \`API\`

---

**Opening (no header)**
What is this video about? One sentence that captures the core idea.

**Key Points**
The 3-5 most important things from this video. Be specific.

Use whatever formatting makes it clearest:
• Bullet points
• Short paragraphs
• Quote blocks for memorable statements
• Mix formats if needed

Focus on actual information, not filler.

**Why Watch**
What value does someone get from this? One sentence.

**Jump To**
3 timestamps where the most valuable content happens:
• [00:00] Description
• [00:00] Description
• [00:00] Description

---

**Cut these:**
- Intro hooks ("Hey guys, welcome back...")
- CTAs ("Don't forget to subscribe...")
- Filler transitions ("So let's get into it...")
- Personal anecdotes unless they demonstrate the point

**Tone:** Clear and helpful. Extract value without overthinking the structure.
`;

export const PROMPT_META = {
  NAME: "Generic Video Summarizer v2.0",
  DESCRIPTION: "Fallback summarizer for videos that don't fit standard categories",
  ID: "youtube-generic-v2.0",
  ESSENCE: "youtube",
  TYPE: "GENERIC",
  NOTES: "Enhanced with empathy opener, clearer key points guidance, and explicit cut list. Used when classifier returns invalid JSON, empty response, or content doesn't match type patterns.",
};
