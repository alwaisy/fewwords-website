declare module '#auth-utils' {
  interface User {
    id: string
    email: string
    name: string
    username?: string
    role?: 'user' | 'admin'
    createdAt?: string
  }

  interface UserSession {
    // Add custom session fields if needed
    provider?: string
  }
}

export {}
