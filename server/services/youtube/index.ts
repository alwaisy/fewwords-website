import { YOUTUBE_CONFIG } from './config'
import { YOUTUBE_PROMPT, PROMPT_META } from '../../prompts/youtube'
import { callLLM } from '../shared/llm'

export interface YouTubeResult {
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

export async function summarize(url: string): Promise<YouTubeResult> {
  // Step 1: Call LLM directly (no fetcher for YouTube)
  const llmResult = await callLLM({
    provider: YOUTUBE_CONFIG.provider,
    model: YOUTUBE_CONFIG.model,
    prompt: `${YOUTUBE_PROMPT}\n\nURL: ${url}`,
    temperature: YOUTUBE_CONFIG.temperature,
    maxTokens: YOUTUBE_CONFIG.maxTokens,
  })

  return {
    url,
    type: 'youtube',
    summary: llmResult.content,
    model: llmResult.model,
    promptId: PROMPT_META.ID,
    usage: llmResult.usage,
  }
}
