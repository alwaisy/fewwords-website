const JINA_READER_URL = 'https://r.jina.ai/http://'

interface JinaJSONResponse {
  code: number
  data: {
    title?: string
    description?: string
    url?: string
    content: string
  } | null
}

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

export async function fetchWithJina(url: string): Promise<FetcherResponse> {
  try {
    const cleanUrl = url.replace(/^https?:\/\//, '')
    const jinaUrl = `${JINA_READER_URL}${cleanUrl}`

    const config = useRuntimeConfig();
    const response = await $fetch<JinaJSONResponse>(jinaUrl, {
      headers: {
        'Authorization': `Bearer ${config.private.jinaAiKey}`,
        'Accept': 'application/json',
        'X-Engine': 'cf-browser-rendering',
      },
      timeout: 30000,
    })

    // Check for Jina API errors
    if (!response || response.code !== 200 || !response.data) {
      const errorMsg = response?.data ? 'Empty response' : 'Jina API error'
      throw new Error(`${errorMsg}: ${JSON.stringify(response)}`)
    }

    const { title, description, content } = response.data

    // Check if content is too short (likely an error page)
    if (content.length < 100) {
      throw new Error('Content too short, possibly blocked')
    }

    // Calculate content stats
    const wordCount = countWords(content)
    const readingTimeMinutes = calculateReadingTime(wordCount)
    const domain = extractDomain(url) // Extract from original URL, not cleanUrl

    return {
      content,
      title, // From JSON response
      // SEO metadata from JSON response
      metaTitle: title,
      metaDescription: description,
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
    // Re-throw with clear message for DB storage
    if (error instanceof Error) {
      throw error
    }

    throw new Error(`Failed to fetch article: ${error}`)
  }
}
