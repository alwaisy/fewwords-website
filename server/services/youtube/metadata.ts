export interface YouTubeVideoMetadata {
  title: string
  description: string
  channelTitle: string
  durationMinutes: number // Duration in minutes
  tags: string[]
  isAgeRestricted: boolean // Age-restricted content
  isLive: boolean // Live stream or upcoming live stream
  isLiveContent: boolean // Currently live
  statistics: {
    viewCount: string
    likeCount: string
    commentCount: string
  }
}

export interface YouTubeChannelMetadata {
  title: string
  description: string
  country?: string
  subscriberCount: string
  videoCount: string
  keywords?: string
}

interface YouTubeMetadataResult {
  video: YouTubeVideoMetadata
  channel: YouTubeChannelMetadata
}

function extractVideoId(url: string): string | null {
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

function parseDuration(isoDuration: string): number {
  // PT26M30S -> 26.5 minutes
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0

  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')

  return hours * 60 + minutes + seconds / 60
}

export async function fetchYouTubeMetadata(
  url: string,
  apiKey: string
): Promise<YouTubeMetadataResult> {
  const videoId = extractVideoId(url)
  if (!videoId) {
    throw new Error('Invalid YouTube URL. Could not extract video ID.')
  }

  // Fetch video metadata
  const videoUrl = new URL('https://www.googleapis.com/youtube/v3/videos')
  videoUrl.searchParams.append('part', 'snippet,contentDetails,statistics,status,liveStreamingDetails')
  videoUrl.searchParams.append('id', videoId)
  videoUrl.searchParams.append('key', apiKey)

  const videoResponse = await fetch(videoUrl.toString())
  if (!videoResponse.ok) {
    throw new Error(`YouTube API Error: ${videoResponse.status} ${videoResponse.statusText}`)
  }

  const videoData = await videoResponse.json()
  if (!videoData.items?.[0]) {
    throw new Error('Video not found')
  }

  const videoItem = videoData.items[0]
  const channelId = videoItem.snippet.channelId

  // Fetch channel metadata
  const channelUrl = new URL('https://www.googleapis.com/youtube/v3/channels')
  channelUrl.searchParams.append('part', 'snippet,statistics,brandingSettings')
  channelUrl.searchParams.append('id', channelId)
  channelUrl.searchParams.append('key', apiKey)

  const channelResponse = await fetch(channelUrl.toString())
  if (!channelResponse.ok) {
    throw new Error(`YouTube API Error: ${channelResponse.status} ${channelResponse.statusText}`)
  }

  const channelData = await channelResponse.json()
  if (!channelData.items?.[0]) {
    throw new Error('Channel not found')
  }

  const channelItem = channelData.items[0]

  // Parse video metadata
  const video: YouTubeVideoMetadata = {
    title: videoItem.snippet.title,
    description: videoItem.snippet.description || '',
    channelTitle: videoItem.snippet.channelTitle,
    durationMinutes: parseDuration(videoItem.contentDetails.duration),
    tags: videoItem.snippet.tags || [],
    isAgeRestricted: videoItem.contentDetails.contentRating?.ytRating === 'ytAgeRestricted',
    isLive: videoItem.snippet.liveBroadcastContent === 'live' || videoItem.snippet.liveBroadcastContent === 'upcoming',
    isLiveContent: videoItem.snippet.liveBroadcastContent === 'live',
    statistics: {
      viewCount: videoItem.statistics.viewCount || '0',
      likeCount: videoItem.statistics.likeCount || '0',
      commentCount: videoItem.statistics.commentCount || '0',
    },
  }

  // Parse channel metadata
  const channel: YouTubeChannelMetadata = {
    title: channelItem.snippet.title,
    description: channelItem.snippet.description || '',
    country: channelItem.snippet.country,
    subscriberCount: channelItem.statistics.subscriberCount || '0',
    videoCount: channelItem.statistics.videoCount || '0',
    keywords: channelItem.brandingSettings?.channel?.keywords,
  }

  return { video, channel }
}
