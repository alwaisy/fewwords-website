import { ARTICLE_CONFIG } from './config'
import { fetchWithJina, type FetcherResponse } from './fetcher'
import { classifyArticle, type ClassifierResult } from './classifier'
import { getPrompt, getPromptMeta } from '../../prompts/article'
import { callOpenRouter } from '../shared/llm'
import { WRITING_GUIDELINES } from '../../prompts/system'

export interface ArticleMetadata {
  // Stage 1: SEO metadata
  metaTitle?: string
  metaDescription?: string
  // Stage 1: Source info
  domain?: string
  author?: string
  publishedAt?: Date | null
  // Stage 1: Content stats
  wordCount?: number
  readingTimeMinutes?: number
  // Stage 2: Classifier stats
  classifierModel?: string
  classifierPromptTokens?: number
  classifierCompletionTokens?: number
  classifierTotalTokens?: number
  classifierTimeMs?: number
}

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
  metadata: ArticleMetadata // Article metadata for storage
}

export async function summarize(url: string): Promise<ArticleResult> {
  // Step 1: Fetch article content with metadata
  const fetcherResult = await fetchWithJina(url)
  const { content, ...metadata } = fetcherResult

  // Step 2: Classify article to select best prompt version
  const classifierResult: ClassifierResult = await classifyArticle(content)

  // Step 3: Get the appropriate prompt for this category
  const prompt = getPrompt(classifierResult.version)
  const promptMeta = getPromptMeta(classifierResult.version)

  if (!prompt || !promptMeta) {
    throw new Error(`Prompt version ${classifierResult.version} not found`)
  }

  // Step 4: Call LLM with selected prompt
  const llmResult = await callOpenRouter({
    model: ARTICLE_CONFIG.model,
    messages: [
      { role: "system", content: WRITING_GUIDELINES },
      {
        role: "user",
        content: `${prompt}\n\nContent:\n\n${content}`,
      },
    ],
  })

  // Extract title from LLM response (handles both TITLE: and **TITLE:** formats)
  const titleMatch = llmResult.content ? llmResult.content.match(/^\*\*TITLE:\*\*\s*(.+)$/m) || llmResult.content.match(/^TITLE:\s*(.+)$/m) : null
  const title = titleMatch ? titleMatch[1]?.trim() : undefined

  // Remove TITLE line from summary for display (handles both formats)
  const summary = llmResult.content
    ? llmResult.content
        .replace(/^\*\*TITLE:\*\*\s*.+\n?/m, '')
        .replace(/^TITLE:\s*.+\n?/m, '')
        .trim()
    : ""

  return {
    url,
    type: 'article',
    title,
    summary,
    model: llmResult.model,
    promptId: promptMeta.ID,
    reasoning: classifierResult.reasoning,
    usage: llmResult.usage ? {
      promptTokens: llmResult.usage.promptTokens,
      completionTokens: llmResult.usage.completionTokens,
      totalTokens: llmResult.usage.totalTokens,
    } : undefined,
    metadata: {
      // Stage 1: SEO metadata
      metaTitle: metadata.metaTitle,
      metaDescription: metadata.metaDescription,
      // Stage 1: Source info
      domain: metadata.domain,
      author: metadata.author,
      publishedAt: metadata.publishedAt,
      // Stage 1: Content stats
      wordCount: metadata.wordCount,
      readingTimeMinutes: metadata.readingTimeMinutes,
      // Stage 2: Classifier stats
      classifierModel: 'gpt-5-nano',
      classifierPromptTokens: classifierResult.usage.promptTokens,
      classifierCompletionTokens: classifierResult.usage.completionTokens,
      classifierTotalTokens: classifierResult.usage.totalTokens,
      classifierTimeMs: classifierResult.usage.timeMs,
    },
  }
}
