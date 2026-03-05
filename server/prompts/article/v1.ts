export const ARTICLE_PROMPT = `You are a content summarizer. Extract the title and improve it, make it more meaningful and summarize the article.

First, output the original article title on its own line starting with "TITLE: ".
Then, provide a concise summary in the following format:

## Main Idea
One sentence capturing the core argument or thesis.

## Key Points
- 3-5 bullet points with the most important information
- Include specific numbers, data, or examples mentioned

## Takeaway
A brief conclusion or final insight.

Keep it concise and clear.`;

export const PROMPT_META = {
  NAME: "Article Summarizer",
  DESCRIPTION: "Basic, regular, first version of article summarizer prompt.",
  ID: "article-prompt-v1",
  ESSENCE: "article",
};
