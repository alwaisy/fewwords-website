import { getRequestURL, type H3Event } from 'h3'

/**
 * Get the base URL of the application.
 * Priority:
 * 1. Runtime config 'public.baseUrl' (overridden by NUXT_PUBLIC_BASE_URL)
 * 2. Runtime config 'public.siteUrl' (overridden by NUXT_SITE_URL)
 * 3. Request URL origin (if event is provided)
 * 4. Default to localhost (fallback only)
 */
export const getBaseUrl = (event?: H3Event) => {
  const config = useRuntimeConfig()
  
  // Try config values first (useful for workers or SSR)
  const baseUrl = config.public.baseUrl || config.public.siteUrl
  if (baseUrl) return baseUrl

  // If we have an H3 event, we can get it from the request headers
  if (event) {
    try {
      const url = getRequestURL(event)
      return url.origin
    } catch {
      // Ignore errors in getRequestURL
    }
  }

  // Final fallback (should ideally be avoided in production)
  return 'http://localhost:3000'
}

/**
 * Construct a full URL for a given path.
 */
export const getAppUrl = (path: string, event?: H3Event) => {
  const base = getBaseUrl(event)
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${cleanPath}`
}
