import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateText } from 'ai'
import type { LLMModel } from './types'
import { WRITING_GUIDELINES } from '../../prompts/system'

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
})

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
  const { model, prompt, content, temperature = 0.7, maxTokens = 1000 } = options

  // Build user message
  let userMessage = prompt
  if (content) {
    userMessage += `\n\nContent:\n\n${content}`
  }

  try {
    const response = await generateText({
      model: openrouter(model),
      messages: [
        { role: 'system', content: WRITING_GUIDELINES },
        { role: 'user', content: userMessage },
      ],
      temperature,
      maxOutputTokens: maxTokens,
    })

    return {
      content: response.text,
      model,
      usage: response.usage ? {
        promptTokens: response.usage.inputTokens ?? 0,
        completionTokens: response.usage.outputTokens ?? 0,
        totalTokens: response.usage.totalTokens ?? 0,
      } : undefined,
    }
  }
  catch (error) {
    console.error('LLM API error:', error)
    throw new Error(`LLM request failed: ${error}`)
  }
}
