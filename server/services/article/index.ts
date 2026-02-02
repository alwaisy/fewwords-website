import { ARTICLE_CONFIG } from './config'
import { fetchWithJina } from './fetcher'
import { classifyArticle } from './classifier'
import { getPrompt, getPromptMeta } from '../../prompts/article'
import { callLLM } from '../shared/llm'

export interface ArticleResult {
  url: string
  type: string
  title?: string
  summary: string
  model: string
  promptId: string
  reasoning?: string // Classifier's reasoning for category selection
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export async function summarize(url: string): Promise<ArticleResult> {
  // Step 1: Fetch article content
  const { content } = await fetchWithJina(url)

  // Step 2: Classify article to select best prompt version
  const { category: _category, version, reasoning } = await classifyArticle(content)

  // Step 3: Get the appropriate prompt for this category
  const prompt = getPrompt(version)
  const promptMeta = getPromptMeta(version)

  if (!prompt || !promptMeta) {
    throw new Error(`Prompt version ${version} not found`)
  }

  // Step 4: Call LLM with selected prompt
  const llmResult = await callLLM({
    provider: ARTICLE_CONFIG.provider,
    model: ARTICLE_CONFIG.model,
    prompt,
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
    promptId: promptMeta.ID,
    reasoning,
    usage: llmResult.usage,
  }
}
