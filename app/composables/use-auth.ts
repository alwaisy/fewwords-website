/**
 * Simple auth state composable
 * For now, just tracks if user is logged in
 */
export const useAuth = () => {
  const isLoggedIn = useState<boolean>('isLoggedIn', () => false)

  const login = () => {
    isLoggedIn.value = true
  }

  const logout = () => {
    isLoggedIn.value = false
  }

  return {
    isLoggedIn,
    login,
    logout,
  }
}
