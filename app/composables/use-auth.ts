/**
 * Auth composable - thin wrapper around nuxt-auth-utils
 * Provides custom API endpoints while syncing session state
 *
 * User types are defined in types/auth.d.ts via module augmentation
 */
export type UserRole = 'user' | 'admin'

export const useAuth = () => {
  // Use nuxt-auth-utils for session state (syncs with encrypted cookie)
  const { loggedIn, user, fetch, clear } = useUserSession()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Alias for backward compatibility
  const isLoggedIn = loggedIn

  /**
   * Check if user is authenticated - syncs with server session
   */
  const checkAuth = async () => {
    await fetch()
  }

  /**
   * Send OTP code for login
   */
  const login = async (email: string) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await $fetch<{ success: boolean; exists: boolean; message: string }>('/api/auth/login', {
        method: 'POST',
        body: { email },
      })

      if (!response.exists) {
        error.value = 'No account found with this email'
        return { success: false, message: 'No account found' }
      }

      return { success: true, message: response.message }
    }
    catch (e) {
      const errorMessage = e && typeof e === 'object' && 'message' in e ? String(e.message) : 'Failed to send verification code'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Register new user and send OTP code
   */
  const register = async (email: string, name: string, username: string) => {
    try {
      isLoading.value = true
      error.value = null

      let attributionData = {}
      if (import.meta.client) {
        const { getStoredAttribution } = await import('~/utils/attribution')
        const { useUmamiIdentity } = await import('~/composables/use-umami-identity')
        const { identity } = useUmamiIdentity()
        
        attributionData = {
          ...getStoredAttribution(),
          umamiSessionId: identity.value.sessionId || null,
        }
      }

      const response = await $fetch<{ success: boolean; exists: boolean; message: string }>('/api/auth/register', {
        method: 'POST',
        body: { email, name, username, attribution: attributionData },
      })

      if (response.exists) {
        error.value = 'Account already exists'
        return { success: false, message: 'Account already exists' }
      }

      return { success: true, message: response.message }
    }
    catch (e) {
      const errorMessage = e && typeof e === 'object' && 'message' in e ? String(e.message) : 'Failed to create account'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Verify OTP code - syncs session with server
   */
  const verify = async (code: string) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await $fetch<{ success: boolean; user?: import('#auth-utils').User; message: string }>('/api/auth/verify', {
        method: 'POST',
        body: { code },
      })

      if (response.success) {
        // Sync session with server
        await fetch()
      }

      return response
    }
    catch (e) {
      const errorMessage = e && typeof e === 'object' && 'message' in e ? String(e.message) : 'Verification failed'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Logout user - clears session and redirects to login
   */
  const logout = async () => {
    try {
      isLoading.value = true
      error.value = null

      await $fetch('/api/auth/logout', { method: 'POST' })
      await clear() // Clear nuxt-auth-utils session

      // Redirect to login page
      await navigateTo('/auth/login')

      return { success: true }
    }
    catch (e) {
      const errorMessage = e && typeof e === 'object' && 'message' in e ? String(e.message) : 'Failed to logout'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    user,
    isLoggedIn,
    isLoading: readonly(isLoading),
    error: readonly(error),
    checkAuth,
    login,
    register,
    verify,
    logout,
  }
}
