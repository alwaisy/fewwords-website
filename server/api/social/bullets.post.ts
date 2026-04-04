import { WRITING_GUIDELINES } from "~~/server/prompts/system";
import { callOpenRouter } from "~~/server/services/shared/llm/openrouter";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { summary, model } = body;

  if (!summary) {
    throw createError({
      statusCode: 400,
      statusMessage: "Summary is required",
    });
  }

  const selectedModel = model || 'google/gemma-4-26b-a4b-it';

  const prompt = `You are the lead writer for a popular, highly engaging tech/fintech newsletter. Your job is to translate dry news into a simple, conversational social media post that tells a punchy story.

CRITICAL RULES:
1. NAME DROP ONCE, THEN BE NATURAL: You must mention the specific name of the product, company, or model (e.g., "Gemma 4 26B") early in the post so the reader has context. HOWEVER, do not repeat the full name in every bullet point. Use natural pronouns ("it", "the model", "they") after the first mention so it flows like a human conversation.
2. NO CORPORATE SPEAK: Write like you are explaining this to a friend using punchy, everyday terms.
3. THE POSTER HOOK: The Header is going onto a visual poster. It must be ALL CAPS, max 8 words, and incredibly intriguing. Highlight the catch or the massive shift happening.
4. NO FLUFF/NAMES: Do not invent fictional characters (e.g., "Maria"). Abstract personal anecdotes into broad industry trends.
5. LET THE STORY DICTATE THE BULLETS: Use as many or as few bullet points as needed to accurately cover the core facts of the news. Do not artificially limit or pad the list. However, each individual bullet MUST be ABSOLUTELY NO MORE than 8 words.
6. DASHES ONLY: Use a standard dash "- " for bullets.
7. ABSOLUTELY NO MARKDOWN: Do not use asterisks (*), bolding, or italics anywhere in the text.
8. CONVERSATIONAL ENDING: The final takeaway must start with a natural, casual sign-off phrase (e.g., "So basically", "So yeah", "At the end of the day"). 

REQUIRED FORMAT (Include full blank lines between sections):

[CATCHY HEADER IN ALL CAPS, MAX 8 WORDS]

[1 conversational hook sentence that makes the reader care]

- [Punchy fact 1 driving the story, max 8 words]
- [Punchy fact 2 driving the story...]
- [Continue with as many bullets as needed to tell the story]

[Casual Sign-off] - [1 witty, relatable takeaway sentence]

Text to summarize:
"""
${summary}
"""`;

  try {
    const result = await callOpenRouter({
      model: selectedModel,
      messages: [
        { role: "system", content: WRITING_GUIDELINES },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      maxTokens: 500,
    });

    return {
      content: result.content,
    };
  } catch (error) {
    console.error("Error generating bullets:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to generate bullets",
    });
  }
});