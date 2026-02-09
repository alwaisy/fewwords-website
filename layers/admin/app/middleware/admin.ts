/**
 * Admin middleware - Protects admin routes
 * Checks if user is authenticated AND has admin role
 */
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn, session } = useUserSession()

  if (!loggedIn.value || !session.value?.user) {
    return navigateTo('/auth/login')
  }

  // Type assertion: our User has role field
  const user = session.value.user as { role?: string }
  if (user.role !== 'admin') {
    return navigateTo('/')
  }
})
