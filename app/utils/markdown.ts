/**
 * Converts YouTube timestamps in markdown to clickable links
 * Example: "02:01" becomes "[02:01](https://www.youtube.com/watch?v=VIDEO_ID&t=121)"
 */
export function convertYoutubeTimestamps(
  markdown: string,
  videoUrl: string
): string {
  // Extract video ID from URL
  const videoId = extractVideoId(videoUrl)
  if (!videoId) return markdown

  // Pattern to match timestamps like:
  // - 02:01
  // - 2:01
  // - 10:05
  // - 1:23:45 (hours:minutes:seconds)
  const timestampPattern = /\b(\d{1,2}):(\d{2})(?::(\d{2}))?\b/g

  return markdown.replace(timestampPattern, (match) => {
    const parts = match.split(':').map(Number)

    let seconds = 0
    if (parts.length === 3) {
      // HH:MM:SS
      seconds = parts[0]! * 3600 + parts[1]! * 60 + parts[2]!
    } else {
      // MM:SS
      seconds = parts[0]! * 60 + parts[1]!
    }

    const url = `https://www.youtube.com/watch?v=${videoId}&t=${seconds}`
    return `[${match}](${url})`
  })
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
