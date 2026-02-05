import { callLLM } from '../shared/llm'
import { YOUTUBE_SUMMARIZER_CONFIG } from './config'
import { YOUTUBE_PROMPTS, type YouTubeVideoType } from '../../prompts/youtube'
import type { ClassifierResult } from './classifier'

interface SummaryInput {
  videoUrl: string
  classifier: ClassifierResult
}

export async function summarizeVideo(input: SummaryInput): Promise<string> {
  const { videoUrl, classifier } = input

  // Get type-specific prompt
  const promptGetter = YOUTUBE_PROMPTS[classifier.category as YouTubeVideoType]
  if (!promptGetter) {
    throw new Error(`No prompt found for category: ${classifier.category}`)
  }

  const typePrompt = await promptGetter()

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

  const result = await callLLM({
    provider: YOUTUBE_SUMMARIZER_CONFIG.provider,
    model: YOUTUBE_SUMMARIZER_CONFIG.model,
    prompt: enrichedPrompt,
    reasoning: YOUTUBE_SUMMARIZER_CONFIG.reasoning,
    // @ts-expect-error - tools format is provider-specific
    tools: YOUTUBE_SUMMARIZER_CONFIG.tools,
    temperature: YOUTUBE_SUMMARIZER_CONFIG.temperature,
    maxTokens: YOUTUBE_SUMMARIZER_CONFIG.maxTokens,
    files: [
      {
        name: 'video',
        mimeType: 'video/*',
        url: videoUrl,
      },
    ],
  })

  return result.content
}
