import { drizzle } from 'drizzle-orm/postgres-js'
import type { H3Event } from 'h3'
import postgres from 'postgres'

import * as schema from '~~/db/schema'

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

  const databaseUrl = process.env.DATABASE_URL

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
export const db = drizzle(postgres(process.env.DATABASE_URL!), { schema })
