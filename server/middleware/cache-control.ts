export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  
  // Cache static assets from public/assets/ (fonts, etc.)
  if (url.pathname.startsWith('/assets/') || url.pathname.endsWith('.mp4') || url.pathname.endsWith('.png') || url.pathname.endsWith('.svg')) {
    setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
  }
})
