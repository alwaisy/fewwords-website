import { WRITING_GUIDELINES } from "~~/server/prompts/system";
import { callOpenRouter } from "~~/server/services/shared/llm/openrouter";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { summary, summaryUrl, model } = body;

  if (!summary || !summaryUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: "Summary and summary URL are required",
    });
  }

  const selectedModel = model || 'google/gemma-4-26b-a4b-it';

  const prompt = `You are the community manager for a popular, highly engaging tech/fintech newsletter. Your job is to write the very first comment under a social media post to drive engagement and drop a link.

CRITICAL RULES:
1. MATCH THE VIBE: Write in a witty, conversational, human tone. Zero corporate jargon or robotic phrasing.
2. NO PREFIXES OR FLUFF: ONLY output the comment text. Do not start with "Here is the comment:" or "Comment:".
3. ABSOLUTELY NO MARKDOWN: Do not use asterisks (*), bolding, or italics anywhere. 
4. THE QUESTION: The question at the end must be casual and something a real person would actually reply to (e.g., avoid stiff questions like "What are your thoughts on this development?").

REQUIRED FORMAT:

[1 short, conversational observation or slightly spicy take on the news]

Read the full breakdown here: ${summaryUrl}

[1 casual, highly engaging question to the audience]

Text to comment on:
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
      maxTokens: 300,
    });

    return {
      comment: result.content,
    };
  } catch (error) {
    console.error("Error generating comment:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to generate comment",
    });
  }
});