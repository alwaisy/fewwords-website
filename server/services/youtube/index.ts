import { fetchYouTubeMetadata } from './metadata'
import { classifyVideo } from './classifier'
import { summarizeVideo } from './summarizer'
import { summaries, youtube } from '~~/db/schema'
import { eq } from 'drizzle-orm'
import { YOUTUBE_PROMPTS, type YouTubeVideoType } from '../../prompts/youtube'

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

export async function summarize(
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db?: any, // Drizzle database instance
  summaryId?: string
): Promise<YouTubeResult> {

  // Extract videoId from URL for database
  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&\s]+)/,
      /(?:youtu\.be\/)([^\s?]+)/,
      /(?:youtube\.com\/embed\/)([^\s?]+)/,
      /(?:youtube\.com\/v\/)([^\s?]+)/,
      /(?:youtube\.com\/shorts\/)([^\s?]+)/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match?.[1]) return match[1]
    }

    return null
  }

  const videoId = extractVideoId(url)

  // Stage 1: Fetch metadata from YouTube Data API
  const { video, channel } = await fetchYouTubeMetadata(
    url,
    process.env.YOUTUBE_DATA_API_KEY!
  )

  // Stage 1 save: Insert video metadata to youtube table
  if (db && summaryId && videoId) {
    // Get internal UUID from summaryId
    const summaryRecord = await db.select({ id: summaries.id })
      .from(summaries)
      .where(eq(summaries.summaryId, summaryId))
      .limit(1)

    const internalId = summaryRecord[0]?.id

    if (internalId) {
      await db.insert(youtube).values({
        summaryId: internalId,
        videoId,
        originalTitle: video.title,
        description: video.description,
        duration: video.durationMinutes,
        tags: video.tags.length > 0 ? JSON.stringify(video.tags) : null,
        isAgeRestricted: video.isAgeRestricted,
        viewCount: video.statistics.viewCount,
        likeCount: video.statistics.likeCount,
        commentCount: video.statistics.commentCount,
        channelTitle: channel.title,
        channelDescription: channel.description,
        channelSubscriberCount: channel.subscriberCount,
        channelVideoCount: channel.videoCount,
        channelKeywords: channel.keywords || null,
      })
    }
  }

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

  // Stage 2 save: Update classifier results
  if (db && summaryId && videoId) {
    const summaryRecord = await db.select({ id: summaries.id })
      .from(summaries)
      .where(eq(summaries.summaryId, summaryId))
      .limit(1)

    const internalId = summaryRecord[0]?.id

    if (internalId) {
      await db.update(youtube)
        .set({
          cleanTitle: classifier.clean_title,
          channelBio: classifier.channel_bio,
          category: classifier.category,
          trueIntent: classifier.true_intent,
          focusPoints: classifier.focus_points.length > 0 ? JSON.stringify(classifier.focus_points) : null,
          isWorthIt: classifier.is_worth_it,
          classifierReasoning: classifier.reasoning,
          classifierModel: 'google/gemini-3-flash-preview',
          classifierReasoningEffort: 'medium',
          classifierTimeMs: 0, // TODO: Track actual timing
        })
        .where(eq(youtube.videoId, videoId))
    }
  }

  // Early exit if not worth summarizing
  if (!classifier.is_worth_it) {
    // Update summaries table with early exit result
    if (db && summaryId) {
      await db.update(summaries)
        .set({
          title: video.title,
          summary: `This video was classified as not worth summarizing. ${classifier.reasoning}`,
          model: 'N/A',
          promptId: 'N/A',
          reasoning: classifier.reasoning,
          status: 'completed',
          completedAt: new Date(),
        })
        .where(eq(summaries.summaryId, summaryId))
    }

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
  // Get prompt ID from the actual prompt file
  const promptGetter = YOUTUBE_PROMPTS[classifier.category as YouTubeVideoType]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let promptId = 'youtube-unknown-v1'

  if (promptGetter) {
    const promptModule = await promptGetter()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    promptId = (promptModule as any).PROMPT_META?.ID || `youtube-${classifier.category.toLowerCase()}-v1`
  }

  const summaryText = await summarizeVideo({
    videoUrl: url,
    classifier,
  })

  return {
    url,
    type: 'youtube',
    title: classifier.clean_title,
    summary: summaryText,
    model: YOUTUBE_SUMMARIZER_CONFIG.model,
    promptId,
    reasoning: classifier.reasoning,
    usage: {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    },
  }
}
