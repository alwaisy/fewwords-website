const JINA_READER_URL = 'https://r.jina.ai/http://'

export interface FetcherResponse {
  content: string
  title?: string
  // Stage 1: SEO metadata
  metaTitle?: string
  metaDescription?: string
  // Stage 1: Source info
  domain?: string
  author?: string
  publishedAt?: Date | null
  // Stage 1: Content stats
  wordCount?: number
  readingTimeMinutes?: number
}

function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return 'unknown'
  }
}

function calculateReadingTime(wordCount: number): number {
  // Average reading speed: ~200 words per minute
  return Math.ceil(wordCount / 200)
}

function countWords(text: string): number {
  // Remove markdown syntax and count words
  const cleanText = text
    .replace(/#{1,6}\s/g, '') // Headers
    .replace(/\*\*|\*/g, '') // Bold/italic
    .replace(/\[.*?\]\(.*?\)/g, '') // Links
    .replace(/`{1,3}.*?`{1,3}/g, '') // Code blocks
    .replace(/\n+/g, ' ') // Newlines to spaces
  return cleanText.trim().split(/\s+/).filter(w => w.length > 0).length
}

function detectCloudflareProtection(content: string): boolean {
  const indicators = [
    'Just a moment',
    'Checking your browser',
    'DDoS protection',
    'Cloudflare',
    'Please wait while we verify',
    'Verify you are human',
    'challenge-platform',
  ]

  if (!content) return false

  const lowerContent = content.toLowerCase()
  return indicators.some(indicator =>
    lowerContent.includes(indicator.toLowerCase())
  )
}

export async function fetchWithJina(url: string): Promise<FetcherResponse> {
  try {
    const cleanUrl = url.replace(/^https?:\/\//, '')
    const jinaUrl = `${JINA_READER_URL}${cleanUrl}`

    const response = await $fetch<string>(jinaUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.JINA_AI_API_KEY}`,
        'X-Engine': 'cf-browser-rendering',
      },
      timeout: 30000,
    })

    if (!response || typeof response !== 'string') {
      throw new Error('Empty response from Jina API')
    }

    // Check if Jina returned a Cloudflare protection page instead of actual content
    if (detectCloudflareProtection(response)) {
      throw new Error('Site has bot protection - Jina returned Cloudflare page')
    }

    // Check if response is too short (likely an error page)
    if (response.length < 100) {
      throw new Error('Content too short, possibly blocked')
    }

    // Extract title from markdown (first # heading)
    const titleMatch = response.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1]?.trim() : undefined

    // Calculate content stats
    const wordCount = countWords(response)
    const readingTimeMinutes = calculateReadingTime(wordCount)
    const domain = extractDomain(cleanUrl)

    return {
      content: response,
      title,
      // SEO metadata (title is used as metaTitle)
      metaTitle: title,
      metaDescription: undefined, // Could be extracted from HTML in future
      // Source info
      domain,
      author: undefined, // Could be extracted from HTML/schema in future
      publishedAt: null, // Could be extracted from HTML/schema in future
      // Content stats
      wordCount,
      readingTimeMinutes,
    }
  }
  catch (error) {
    console.error('Jina fetch error:', error)

    // Re-throw with clear message for DB storage
    if (error instanceof Error) {
      throw error
    }

    throw new Error(`Failed to fetch article: ${error}`)
  }
}
