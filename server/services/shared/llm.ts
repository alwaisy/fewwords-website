import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import type { LLMModel, LLMProvider } from './types'
import { WRITING_GUIDELINES } from '../../prompts/system'

// Provider instances
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'HTTP-Referer': 'https://fewwords.app',
    'X-Title': 'Fewwords - Content Summarizer',
  },
})

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Provider registry
const providers = {
  openrouter,
  openai,
  anthropic,
} as const

export interface LLMOptions {
  model: LLMModel
  prompt: string
  content?: string
  temperature?: number
  maxTokens?: number
  provider?: LLMProvider
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
  const {
    model,
    prompt,
    content,
    temperature = 0.7,
    maxTokens = 1000,
    provider = 'openrouter',
  } = options

  // Build user message
  let userMessage = prompt
  if (content) {
    userMessage += `\n\nContent:\n\n${content}`
  }

  try {
    const response = await generateText({
      model: providers[provider](model),
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
