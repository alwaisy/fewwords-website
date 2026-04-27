import { PROMPT_VERSIONS, type PromptCategory } from "../../prompts/article";
import { callOpenRouter } from "../shared/llm";

import { CLASSIFIER_CONFIG } from "./config";

const CLASSIFIER_PROMPT = `### ROLE
You are a content classifier. Your job is to analyze an article and select the best summarization strategy.

### THE OPTIONS

v1 - V1_STRUCTURED
- Long-form essays, research papers, opinion pieces, analysis
- Content where "why" matters as much as "what"
- Reader intent: Learn, understand context

v2 - V2_DATA_SHOT
- Product specs, buying guides, recipes, tutorials, how-tos
- Content buried under SEO fluff or backstory
- Reader intent: Extract facts, skip the filler

v3 - V3_DECISION_BRIEF
- News, market updates, announcements, time-sensitive content
- Content where reader asks "should I care about this?"
- Reader intent: Decide quickly, take action

reject - ERROR_OR_BLOCK_PAGE
- MUST meet at least two criteria:
  1. Contains technical block phrases ("Just a moment", "Ray ID", "Verify you are human", "DDoS protection")
  2. The text is nonsensical, repetitive, or consists only of security instructions.
  3. The content is extremely short (under 100 words) and lacks any article structure (no headings, no paragraphs).
- Reader intent: N/A (cannot be summarized)

### DECISION LOGIC (follow this order)

1. Is it a BLOCK PAGE, BOT PROTECTION, or SYSTEM ERROR? → reject
2. Is it NEWS or TIME-SENSITIVE? → v3
3. Does it have SPECS, STEPS, or PRICES? → v2
4. Is it EXPLANATORY or ARGUMENTATIVE? → v1

### OUTPUT RULE
Output your reasoning (1-2 sentences explaining why this category), then the category on a new line.
`;

export interface ClassifierUsageStats {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  reasoningTokens: number;
  timeMs: number;
}

export interface ClassifierResult {
  category: PromptCategory;
  version: string; // The actual version to use (e.g., "v1.2")
  reasoning: string; // Why this category was chosen
  usage: ClassifierUsageStats; // Token usage and timing
}

export async function classifyArticle(
  content: string,
): Promise<ClassifierResult> {
  const startTime = Date.now();

  const llmResult = await callOpenRouter({
    model: CLASSIFIER_CONFIG.model,
    messages: [
      { role: "system", content: "You are a content classifier." },
      {
        role: "user",
        content: `${CLASSIFIER_PROMPT}\n\nContent:\n\n${content}`,
      },
    ],
    reasoning: {
      max_tokens: CLASSIFIER_CONFIG.thinkingBudgetTokens,
    },
  });

  const endTime = Date.now();
  const timeMs = endTime - startTime;

  const trimmed = llmResult.content.trim();
  const lines = trimmed.split("\n").filter((line) => line.trim() !== "");

  // Category is on the last line - match v1, v2, v3, or reject at start
  const categoryLine = lines[lines.length - 1];
  const match = categoryLine?.match(/^(v[1-3]|reject)/i);

  if (!match || !match[1]) {
    // Default to v1 if classification fails
    return {
      category: "v1",
      version: PROMPT_VERSIONS.v1,
      reasoning: "Classification failed - defaulted to v1",
      usage: {
        promptTokens: llmResult.usage?.promptTokens || 0,
        completionTokens: llmResult.usage?.completionTokens || 0,
        totalTokens: llmResult.usage?.totalTokens || 0,
        reasoningTokens: llmResult.usage?.reasoningTokens || 0,
        timeMs,
      },
    };
  }

  const category = match[1].toLowerCase() as PromptCategory;
  const version = category === 'reject' ? 'reject-v1' : PROMPT_VERSIONS[category]!;
  // Everything except the last line is reasoning
  const reasoning = lines.slice(0, -1).join("\n").trim();

  return {
    category,
    version,
    reasoning,
    usage: {
      promptTokens: llmResult.usage?.promptTokens || 0,
      completionTokens: llmResult.usage?.completionTokens || 0,
      totalTokens: llmResult.usage?.totalTokens || 0,
      reasoningTokens: llmResult.usage?.reasoningTokens || 0,
      timeMs,
    },
  };
}
