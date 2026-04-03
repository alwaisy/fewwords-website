import { drizzle } from 'drizzle-orm/postgres-js'
import type { H3Event } from 'h3'
import postgres from 'postgres'

import * as schema from '~~/database/orm/schema'

// Singleton for database client
let dbInstance: ReturnType<typeof drizzle> | null = null
let sqlInstance: postgres.Sql<Record<string, never>> | null = null

/**
 * Get database instance
 *
 * Uses DATABASE_URL to connect to PostgreSQL.
 * Singleton pattern ensures only one connection pool.
 */
export const useDb = async (_event: H3Event) => {
  if (dbInstance) {
    return dbInstance
  }

  const config = useRuntimeConfig()
  const databaseUrl = config.private.databaseUrl

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set')
  }

  // Create postgres connection
  sqlInstance = postgres(databaseUrl, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  })

  dbInstance = drizzle(sqlInstance, { schema })

  return dbInstance
}

// Legacy export for direct imports (will be phased out)
// NOTE: This won't work in production without env vars passed at runtime
// Use useDb() instead
const config = useRuntimeConfig()
export const db = drizzle(postgres(config.private.databaseUrl!), { schema })
