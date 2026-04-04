import { callOpenRouter } from "~~/server/services/shared/llm/openrouter";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { summary } = body;

  if (!summary) {
    throw createError({
      statusCode: 400,
      statusMessage: "Summary is required",
    });
  }

  const prompt = `
You're generating bullet points for a social media post summarizing an article or video. Focus on key facts and their impact.

**Formatting:**
- Use one sentence per bullet point.
- Keep each bullet point concise and engaging.
- Avoid markdown formatting.

---

**Bullet Points:**
- What happened? (Key event or information)
- Why it matters? (Impact or relevance)
- Who is affected? (Audience or stakeholders)
- What's next? (Future implications or actions)

**Tone:** Informative and engaging. Help the audience understand the key points and their significance in a simple and digestible manner.

Summary to bulletize:
"""
${summary}
"""
`;

  try {
    const result = await callOpenRouter({
      model: "openrouter/free",
      messages: [
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      maxTokens: 500,
    });

    return {
      bullets: result.content.split('\n').filter(line => line.trim().startsWith('-')),
    };
  } catch (error) {
    console.error("Error generating bullets:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to generate bullets",
    });
  }
});