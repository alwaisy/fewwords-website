/**
 * Admin middleware - Protects admin routes
 * Checks if user is authenticated AND has admin role
 */
export default defineNuxtRouteMiddleware(async () => {
  console.log('🔒 [ADMIN MIDDLEWARE] Starting...')

  // On server-side: check session directly from request
  if (import.meta.server) {
    console.log('🖥️ [ADMIN MIDDLEWARE] Running on SERVER side')
    const event = useRequestEvent()
    console.log('📨 [ADMIN MIDDLEWARE] Event:', !!event)

    if (!event) {
      console.log('❌ [ADMIN MIDDLEWARE] No event, redirecting to login')
      return navigateTo('/auth/login')
    }

    const session = await getUserSession(event)
    console.log('🍪 [ADMIN MIDDLEWARE] Server session:', JSON.stringify(session, null, 2))

    if (!session?.user) {
      console.log('❌ [ADMIN MIDDLEWARE] No session.user, redirecting to login')
      return navigateTo('/auth/login')
    }

    const user = session.user as { role?: string }
    console.log('👤 [ADMIN MIDDLEWARE] User:', JSON.stringify(user, null, 2))
    console.log('🔑 [ADMIN MIDDLEWARE] User role:', user.role)

    if (user.role !== 'admin') {
      console.log('❌ [ADMIN MIDDLEWARE] Not admin, redirecting to home')
      return navigateTo('/')
    }

    console.log('✅ [ADMIN MIDDLEWARE] Access granted - user is admin')
    return
  }

  // On client-side: check session state
  console.log('💻 [ADMIN MIDDLEWARE] Running on CLIENT side')
  const { loggedIn, session } = useUserSession()
  console.log('📊 [ADMIN MIDDLEWARE] loggedIn:', loggedIn.value)
  console.log('📦 [ADMIN MIDDLEWARE] session:', JSON.stringify(session.value, null, 2))

  // Wait a tick for session to hydrate from cookie
  await nextTick()
  console.log('⏳ [ADMIN MIDDLEWARE] After nextTick')
  console.log('📊 [ADMIN MIDDLEWARE] loggedIn after tick:', loggedIn.value)
  console.log('📦 [ADMIN MIDDLEWARE] session after tick:', JSON.stringify(session.value, null, 2))

  if (!loggedIn.value || !session.value?.user) {
    console.log('❌ [ADMIN MIDDLEWARE] Not logged in or no session.user, redirecting to login')
    return navigateTo('/auth/login')
  }

  const user = session.value.user as { role?: string }
  console.log('👤 [ADMIN MIDDLEWARE] Client user:', JSON.stringify(user, null, 2))
  console.log('🔑 [ADMIN MIDDLEWARE] Client user role:', user.role)

  if (user.role !== 'admin') {
    console.log('❌ [ADMIN MIDDLEWARE] Client: Not admin, redirecting to home')
    return navigateTo('/')
  }

  console.log('✅ [ADMIN MIDDLEWARE] Client: Access granted - user is admin')
})
