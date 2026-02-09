/**
 * Auth middleware - Protects routes that require authentication
 */
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo('/auth/login')
  }
})
