/**
 * Auth middleware - Protects routes that require authentication
 */
export default defineNuxtRouteMiddleware(async () => {
  // Only run on client side
  if (import.meta.server) return

  try {
    const response = await $fetch<{ authenticated: boolean; user: { id: string; email: string; name: string } } | null>('/api/auth/me')

    if (!response?.authenticated) {
      return navigateTo('/auth/login')
    }
  }
  catch {
    return navigateTo('/auth/login')
  }
})
