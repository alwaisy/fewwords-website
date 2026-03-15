export const REVIEW_PROMPT = `Watch this product review or comparison video.

## STRICT FORMATTING RULES
- **Entities:** Italicize companies, products, and core subjects.
- **Technical:** Wrap specs, pricing, and terminology in \`inline code\`.
- **Names:** Put human names in **bold**.
- **Quotes:** Use blockquotes (\`>\`) for notable quotes from the creator.
- **Readability:** Separate all standalone sentences with a full blank line.
- **Rich Data (CRITICAL):** You MUST use Markdown Tables to organize pros, cons, specs, or comparisons. Do not use basic bullet lists for these.

[INSTRUCTION: Write a dynamic, conversational header for the final verdict. Do NOT use "The {xyz}" pattern]
Start with a bold definitive stance (e.g., **Highly Recommended**, **Skip It**, **[Product] Wins**), followed by a one to two sentence explanation.

[INSTRUCTION: Create a Markdown Table to break down the product(s). Do NOT use a header above the table.]
- If reviewing ONE product: Create a 2-column table for "Pros" and "Cons".
- If comparing MULTIPLE products: Create a multi-column table comparing the products across specific features/aspects mentioned in the video.

[INSTRUCTION: Write a dynamic header about who should buy this. Do NOT use "The {xyz}" pattern]
Explain exactly who benefits most from this product.

[INSTRUCTION: Write a dynamic header for alternatives. Do NOT use "The {xyz}" pattern. Skip if no alternatives are mentioned.]
List any alternatives mentioned using standard bullet points (\`- \`).`;

export const PROMPT_META = {
  NAME: "Review Summarizer v1.4",
  DESCRIPTION: "Product evaluations, tech reviews, comparisons",
  ID: "youtube-review-v1.4",
  ESSENCE: "youtube",
  TYPE: "REVIEW",
  NOTES: "Introduced Markdown tables for pros/cons/comparisons, dynamic headers, removed timestamps.",
};
