import { fetchYouTubeMetadata } from './metadata'
import { classifyVideo } from './classifier'
import { summarizeVideo } from './summarizer'

export interface YouTubeResult {
  url: string
  type: string
  title: string
  summary: string
  model: string
  promptId: string
  reasoning: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export async function summarize(url: string): Promise<YouTubeResult> {
  // Stage 1: Fetch metadata from YouTube Data API
  const { video, channel } = await fetchYouTubeMetadata(
    url,
    process.env.YOUTUBE_DATA_API_KEY!
  )

  // Stage 2: Classify video (watch video + determine type)
  const classifier = await classifyVideo({
    title: video.title,
    description: video.description,
    channel: video.channelTitle,
    duration: video.durationMinutes,
    videoUrl: url,
    tags: video.tags,
    isAgeRestricted: video.isAgeRestricted,
  })

  // Early exit if not worth summarizing
  if (!classifier.is_worth_it) {
    return {
      url,
      type: 'youtube',
      title: video.title,
      summary: `This video was classified as not worth summarizing. ${classifier.reasoning}`,
      model: 'N/A',
      promptId: 'N/A',
      reasoning: classifier.reasoning,
    }
  }

  // Stage 3: Summarize with enriched context
  const summaryText = await summarizeVideo({
    videoUrl: url,
    classifier,
  })

  // Extract prompt ID from category
  const promptId = `youtube-${classifier.category.toLowerCase()}-v1`

  return {
    url,
    type: 'youtube',
    title: classifier.clean_title,
    summary: summaryText,
    model: 'google/gemini-3-flash-preview',
    promptId,
    reasoning: classifier.reasoning,
    usage: {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    },
  }
}
