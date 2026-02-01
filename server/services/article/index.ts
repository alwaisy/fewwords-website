import { ARTICLE_CONFIG } from './config'
import { fetchWithJina } from './fetcher'
import { ARTICLE_PROMPT, PROMPT_META } from '../../prompts/article'
import { callLLM } from '../shared/llm'

export interface ArticleResult {
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

export async function summarize(url: string): Promise<ArticleResult> {
  // Step 1: Fetch article content
  const { content } = await fetchWithJina(url)

  // Step 2: Call LLM
  const llmResult = await callLLM({
    model: ARTICLE_CONFIG.model,
    prompt: ARTICLE_PROMPT,
    content,
    temperature: ARTICLE_CONFIG.temperature,
    maxTokens: ARTICLE_CONFIG.maxTokens,
  })

  // Extract title from LLM response (handles both TITLE: and **TITLE:** formats)
  const titleMatch = llmResult.content.match(/^\*\*TITLE:\*\*\s*(.+)$/m) || llmResult.content.match(/^TITLE:\s*(.+)$/m)
  const title = titleMatch ? titleMatch[1]?.trim() : undefined

  // Remove TITLE line from summary for display (handles both formats)
  const summary = llmResult.content
    .replace(/^\*\*TITLE:\*\*\s*.+\n?/m, '')
    .replace(/^TITLE:\s*.+\n?/m, '')
    .trim()

  return {
    url,
    type: 'article',
    title,
    summary,
    model: llmResult.model,
    promptId: PROMPT_META.ID,
    usage: llmResult.usage,
  }
}
