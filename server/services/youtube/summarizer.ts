import { WRITING_GUIDELINES } from '../../prompts/system'
import { YOUTUBE_PROMPTS, type YouTubeVideoType } from '../../prompts/youtube'
import { callOpenRouter } from '../shared/llm'

import type { ClassifierResult } from './classifier'
import { SUMMARIZATION_CONFIG } from './config'


interface SummaryInput {
  transcript: string
  classifier: ClassifierResult
}

interface SummaryResult {
  content: string
  promptId: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export async function summarizeVideo(input: SummaryInput): Promise<SummaryResult> {
  const { transcript, classifier } = input

  // Get type-specific prompt module
  const promptGetter = YOUTUBE_PROMPTS[classifier.category as YouTubeVideoType]
  if (!promptGetter) {
    throw new Error(`No prompt found for category: ${classifier.category}`)
  }

  const promptModule = await promptGetter()

  // Extract the actual prompt string from the module
  // Each folder exports a generic PROMPT (and type-specific for backward compat)
  const typePrompt = (promptModule as Record<string, unknown>).PROMPT as string
  const promptMeta = (promptModule as Record<string, unknown>).PROMPT_META as { ID: string }

  // Build enriched prompt with classifier insights
  const enrichedPrompt = `
You are summarizing a ${classifier.category} video.

Context from analysis:
- True Intent: ${classifier.true_intent}
- Focus Points: ${classifier.focus_points.join('\n')}
- Channel: ${classifier.channel_bio}

${typePrompt}

FULL METADATA:
- Title: ${classifier.metadata.title}
- Description: ${classifier.metadata.description}
- Channel: ${classifier.metadata.channel}
- Duration: ${classifier.metadata.duration} minutes
- Tags: ${classifier.metadata.tags?.slice(0, 10).join(', ') || 'N/A'}
- Age Restricted: ${classifier.metadata.isAgeRestricted ? 'Yes' : 'No'}

TRANSCRIPT:
${transcript}
`.trim()

  const result = await callOpenRouter({
    model: SUMMARIZATION_CONFIG.model,
    reasoning: SUMMARIZATION_CONFIG.reasoning,
    messages: [
      {
        role: "system",
        content: WRITING_GUIDELINES,
      },
      {
        role: "user",
        content: enrichedPrompt,
      },
    ],
  })

  return {
    content: result.content,
    promptId: promptMeta.ID,
    usage: result.usage,
  }
}
