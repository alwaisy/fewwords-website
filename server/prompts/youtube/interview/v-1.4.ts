export const INTERVIEW_PROMPT = `Watch this interview or podcast video.

## STRICT FORMATTING RULES
- **Entities:** Italicize companies, products, and core subjects.
- **Technical:** Wrap developer terminology, specific concepts, or book titles mentioned in \`inline code\`.
- **Names:** Put human names in **bold**.
- **Quotes:** Use markdown blockquotes (\`>\`) without quotation marks.
- **Readability (CRITICAL):** You MUST separate EVERY single sentence or list item with a full blank line. DO NOT use soft line breaks. DO NOT cluster sentences into dense paragraphs.
- **Lists:** Use standard markdown bullets (\`- \`) for unordered lists.

[INSTRUCTION: Start directly with ONE sentence explaining who is being interviewed (the guest) and their core expertise or reason for being there. DO NOT use a header for this opening.]

[INSTRUCTION: Write a dynamic, conversational header for the main topics discussed. Max 3 words, casual language, do not use "The {xyz}" pattern]
The 3-5 key topics or themes covered in the conversation. You MUST use bullet points (\`- \`).

[INSTRUCTION: Write a dynamic, conversational header for the most valuable takeaways. Max 3 words, casual language, do not use "The {xyz}" pattern]
The best insights or specific advice given by the guest. Be specific. You MUST use bullet points (\`- \`).

[INSTRUCTION: Write a dynamic header for notable quotes. Max 3 words, casual language, do not use "The {xyz}" pattern. Skip this section entirely if there are no strong, standalone quotes.]
Provide 2-3 memorable, exact quotes from the guest. You MUST format each quote as a markdown blockquote (\`> \`) followed by the speaker's name. Separate each quote with a full blank line.`;

export const PROMPT_META = {
  NAME: "Interview Summarizer v1.4",
  DESCRIPTION: "Podcasts, conversations, Q&A, guest appearances",
  ID: "youtube-interview-v1.4",
  ESSENCE: "youtube",
  TYPE: "INTERVIEW",
  NOTES: "Strict formatting, dynamic headers without leakage, enforced markdown blockquotes for the quotes section, removed timestamps.",
};
