import { REDDIT_CONFIG } from './config'
import { REDDIT_PROMPT, PROMPT_META } from '../../prompts/reddit'
import { callOpenRouter } from '../shared/llm'
import { WRITING_GUIDELINES } from '../../prompts/system'

export interface RedditResult {
  url: string
  type: string
  title?: string
  summary: string
  model: string
  promptId: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export async function summarize(url: string): Promise<RedditResult> {
  // Step 1: Call LLM directly (scraper TBA)
  const llmResult = await callOpenRouter({
    model: REDDIT_CONFIG.model,
    messages: [
      { role: "system", content: WRITING_GUIDELINES },
      {
        role: "user",
        content: `${REDDIT_PROMPT}\n\nURL: ${url}`,
      },
    ],
  })

  return {
    url,
    type: 'reddit',
    summary: llmResult.content || "",
    model: llmResult.model,
    promptId: PROMPT_META.ID,
    usage: llmResult.usage,
  }
}
