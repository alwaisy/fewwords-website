/**
 * Admin middleware - Protects admin routes
 * Checks if user is authenticated AND has admin role
 */
export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn, session, fetch } = useUserSession()

  // On server, force fetch session to ensure it's fresh
  if (import.meta.server) {
    await fetch()
  }

  if (!loggedIn.value || !session.value?.user) {
    return navigateTo('/auth/login')
  }

  const user = session.value.user as { role?: string }
  if (user.role !== 'admin') {
    return navigateTo('/')
  }
})
