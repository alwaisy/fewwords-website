export const EDUCATION_PROMPT = `Watch this educational video or lecture.

## STRICT FORMATTING RULES
- **Entities:** Italicize companies, products, and core subjects.
- **Technical:** Wrap developer terminology, scientific terms, or specific concepts in \`inline code\`.
- **Names:** Put human names in **bold**.
- **Quotes:** Use markdown blockquotes (\`>\`) without quotation marks.
- **Readability (CRITICAL):** You MUST separate EVERY single sentence, list item, or paragraph with a full blank line. DO NOT use soft line breaks. DO NOT cluster sentences into dense paragraphs.
- **Lists:** Use standard markdown bullets (\`- \`) for unordered lists. Use numbers (\`1. \`) for ordered steps.

[INSTRUCTION: Write a dynamic, conversational header about the core topic. Max 3 words, casual language, do not use "The {xyz}" pattern]
What is being taught? State the core thesis or topic in ONE sentence.

## KEY CONCEPTS
The main ideas, theories, or frameworks explained. You MUST use bullet points (\`- \`).

## HOW IT WORKS
A step-by-step explanation of the mechanism, process, or history. You MUST break this down into a numbered list (\`1. \`) or clearly separated short bullet points (\`- \`) to explain the flow. Do not write a massive paragraph.

## REAL WORLD
Practical applications, real-world examples, or case studies mentioned. You MUST use bullet points (\`- \`). If none are mentioned, skip this section entirely.`;

export const PROMPT_META = {
  NAME: "Education Summarizer v1.4",
  DESCRIPTION: "Lectures, explainers, documentary style",
  ID: "youtube-education-v1.4",
  ESSENCE: "youtube",
  TYPE: "EDUCATION",
  NOTES: "Strict formatting rules, dynamic header without leakage, structured How It Works section, removed timestamps.",
};
