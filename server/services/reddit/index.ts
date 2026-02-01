import { REDDIT_CONFIG } from './config'
import { REDDIT_PROMPT, PROMPT_META } from '../../prompts/reddit'
import { callLLM } from '../shared/llm'

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
  const llmResult = await callLLM({
    model: REDDIT_CONFIG.model,
    prompt: `${REDDIT_PROMPT}\n\nURL: ${url}`,
    temperature: REDDIT_CONFIG.temperature,
    maxTokens: REDDIT_CONFIG.maxTokens,
  })

  return {
    url,
    type: 'reddit',
    summary: llmResult.content,
    model: llmResult.model,
    promptId: PROMPT_META.ID,
    usage: llmResult.usage,
  }
}
