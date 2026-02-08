/**
 * Auth composable for nuxt-auth-utils based authentication
 */
export interface User {
  id: string
  email: string
  name: string
  username?: string
  createdAt?: string
}

export const useAuth = () => {
  // Auth state
  const user = useState<User | null>('user', () => null)
  const isLoggedIn = computed(() => user.value !== null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Check if user is authenticated
   */
  const checkAuth = async () => {
    try {
      isLoading.value = true
      error.value = null

      const response = await $fetch<{ authenticated: boolean; user: User | null }>('/api/auth/me')

      if (response.authenticated && response.user) {
        user.value = response.user
      }
      else {
        user.value = null
      }
    }
    catch (e) {
      console.error('Check auth error:', e)
      user.value = null
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Send magic link for login
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
      const errorMessage = e && typeof e === 'object' && 'message' in e ? String(e.message) : 'Failed to send magic link'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Register new user and send magic link
   */
  const register = async (email: string, name: string, username: string) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await $fetch<{ success: boolean; exists: boolean; message: string }>('/api/auth/register', {
        method: 'POST',
        body: { email, name, username },
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
   * Verify magic link token
   */
  const verify = async (token: string) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await $fetch<{ success: boolean; user?: User; message: string }>('/api/auth/verify', {
        method: 'POST',
        body: { token },
      })

      if (response.success && response.user) {
        user.value = response.user
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
   * Logout user
   */
  const logout = async () => {
    try {
      isLoading.value = true
      error.value = null

      await $fetch('/api/auth/logout', { method: 'POST' })

      user.value = null
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
    user: readonly(user),
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
