/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return 'unknown'
  }
}

/**
 * Format date to readable format
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Get essence type label
 */
export function getEssenceLabel(essence: string): string {
  switch (essence) {
    case 'article':
      return 'Article'
    case 'youtube':
      return 'YouTube'
    case 'reddit':
      return 'Reddit'
    default:
      return essence
  }
}
