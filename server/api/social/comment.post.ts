import { callOpenRouter } from "~~/server/services/shared/llm/openrouter";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { summary, summaryUrl } = body;

  if (!summary || !summaryUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: "Summary and summary URL are required",
    });
  }

  const prompt = `
You're generating a first comment for a social media post summarizing an article or video. The comment should engage the audience and encourage discussion.

**Formatting:**
- Keep the comment concise and engaging.
- Include a link to the summary for more details.
- Ask a relevant question to encourage discussion.

---

**First Comment:**
[Engaging comment about the summary]

Read the full summary here: ${summaryUrl}

[Relevant question to encourage discussion?]

**Tone:** Informative and engaging. Encourage the audience to read the summary and participate in the discussion.

Summary to comment on:
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