const JINA_READER_URL = 'https://r.jina.ai/http://'

export interface FetcherResponse {
  content: string
  title?: string
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

    // Extract title from markdown (first # heading)
    const titleMatch = response?.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1]?.trim() : undefined

    return {
      content: response || '',
      title,
    }
  }
  catch (error) {
    console.error('Jina fetch error:', error)
    throw new Error(`Failed to fetch article: ${error}`)
  }
}
