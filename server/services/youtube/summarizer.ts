import { callOpenRouter } from '../shared/llm'
import { YOUTUBE_SUMMARIZER_CONFIG } from './config'
import { YOUTUBE_PROMPTS, type YouTubeVideoType } from '../../prompts/youtube'
import type { ClassifierResult } from './classifier'
import { WRITING_GUIDELINES } from '../../prompts/system'

interface SummaryInput {
  videoUrl: string
  classifier: ClassifierResult
}

interface SummaryResult {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export async function summarizeVideo(input: SummaryInput): Promise<SummaryResult> {
  const { videoUrl, classifier } = input

  // Get type-specific prompt module
  const promptGetter = YOUTUBE_PROMPTS[classifier.category as YouTubeVideoType]
  if (!promptGetter) {
    throw new Error(`No prompt found for category: ${classifier.category}`)
  }

  const promptModule = await promptGetter()

  // Extract the actual prompt string from the module
  // Each module exports a specific prompt (e.g., EDUCATION_PROMPT, TUTORIAL_PROMPT)
  const promptKey = `${classifier.category.toUpperCase()}_PROMPT`
  const typePrompt = (promptModule as Record<string, unknown>)[promptKey] as string

  // Build enriched prompt with classifier insights
  const enrichedPrompt = `
You are summarizing a ${classifier.category} video.

Video: ${videoUrl}

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
`.trim()

  const result = await callOpenRouter({
    model: YOUTUBE_SUMMARIZER_CONFIG.model,
    messages: [
      {
        role: "system",
        content: WRITING_GUIDELINES,
      },
      {
        role: "user",
        content: [
          { type: "text", text: enrichedPrompt },
          {
            type: "input_video",
            videoUrl: { url: videoUrl },
          },
        ],
      },
    ],
    reasoning: YOUTUBE_SUMMARIZER_CONFIG.reasoning,
  })

  return {
    content: result.content,
    usage: result.usage,
  }
}
