import type { LLMModel } from './types'
import { WRITING_GUIDELINES } from '../../prompts/system'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

export interface LLMOptions {
  model: LLMModel
  prompt: string
  content?: string
  temperature?: number
  maxTokens?: number
}

export interface LLMResult {
  content: string
  model: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export async function callLLM(options: LLMOptions): Promise<LLMResult> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set')
  }

  const { model, prompt, content, temperature = 0.7, maxTokens = 1000 } = options

  // Build user message
  let userMessage = prompt
  if (content) {
    userMessage += `\n\nContent:\n\n${content}`
  }

  try {
    const response = await $fetch<{
      choices: Array<{
        message: { content: string }
      }>
      usage?: {
        prompt_tokens: number
        completion_tokens: number
        total_tokens: number
      }
    }>(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        model,
        messages: [
          { role: 'system', content: WRITING_GUIDELINES },
          { role: 'user', content: userMessage },
        ],
        temperature,
        max_tokens: maxTokens,
      },
    })

    return {
      content: response.choices[0]?.message?.content || '',
      model,
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
    }
  }
  catch (error) {
    console.error('LLM API error:', error)
    throw new Error(`LLM request failed: ${error}`)
  }
}
