/**
 * Admin middleware - Protects admin routes
 * Checks if user is authenticated AND has admin role
 */
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn, session } = useUserSession()

  console.log('[ADMIN MIDDLEWARE] loggedIn:', loggedIn.value)
  console.log('[ADMIN MIDDLEWARE] session:', JSON.stringify(session.value, null, 2))

  if (!loggedIn.value || !session.value?.user) {
    console.log('[ADMIN MIDDLEWARE] Not authenticated')
    return navigateTo('/auth/login')
  }

  // Type assertion: our User has role field
  const user = session.value.user as { role?: string }
  if (user.role !== 'admin') {
    console.log('[ADMIN MIDDLEWARE] Not admin, role:', user.role)
    return navigateTo('/')
  }

  console.log('[ADMIN MIDDLEWARE] ✅ Admin access granted')
})
