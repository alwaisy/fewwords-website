import { callOpenAI } from "../shared/llm";
import { PROMPT_VERSIONS, type PromptCategory } from "../../prompts/article";

const CLASSIFIER_PROMPT = `### ROLE
You are a content classifier. Your job is to analyze an article and select the best summarization strategy.

### THE THREE OPTIONS

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

### DECISION LOGIC (follow this order)

1. Is it NEWS or TIME-SENSITIVE? → v3
2. Does it have SPECS, STEPS, or PRICES? → v2
3. Is it EXPLANATORY or ARGUMENTATIVE? → v1


### OUTPUT RULE
Output your reasoning (1-2 sentences explaining why this category), then the category on a new line.

`;
// 4. Not sure? → v1 (safe default)
// Example output:
// This article has product specs and comparison tables. Reader wants to extract facts.
// v2

export interface ClassifierResult {
  category: PromptCategory;
  version: string; // The actual version to use (e.g., "v1.2")
  reasoning: string; // Why this category was chosen
}

export async function classifyArticle(
  content: string,
): Promise<ClassifierResult> {
  const llmResult = await callOpenAI({
    model: "gpt-4.1-2025-04-14", // GPT-5 Mini (reasoning model)
    messages: [
      { role: "system", content: "You are a content classifier." },
      {
        role: "user",
        content: `${CLASSIFIER_PROMPT}\n\nContent:\n\n${content}`,
      },
    ],
  });

  console.log("=== CLASSIFIER RAW RESPONSE ===");
  console.log(llmResult.content);
  console.log("=== END CLASSIFIER RESPONSE ===");

  const trimmed = llmResult.content.trim();
  const lines = trimmed.split("\n").filter((line) => line.trim() !== "");

  // Category is on the last line - match v1, v2, or v3 at start (ignores extra text after)
  const categoryLine = lines[lines.length - 1];
  const match = categoryLine?.match(/^(v[1-3])/i);

  if (!match || !match[1]) {
    console.log(llmResult);
    console.warn("Classifier returned unexpected value:", llmResult.content);
    // Default to v1 if classification fails
    return {
      category: "v1",
      version: PROMPT_VERSIONS.v1,
      reasoning: "Classification failed - defaulted to v1",
    };
  }

  const category = match[1].toLowerCase() as PromptCategory;
  const version = PROMPT_VERSIONS[category]!;
  // Everything except the last line is reasoning
  const reasoning = lines.slice(0, -1).join("\n").trim();

  console.log("=== CLASSIFIER RESULT ===");
  console.log("Category:", category);
  console.log("Version:", version);
  console.log("Reasoning:", reasoning);
  console.log("=== END CLASSIFIER RESULT ===");

  return {
    category,
    version,
    reasoning,
  };
}
