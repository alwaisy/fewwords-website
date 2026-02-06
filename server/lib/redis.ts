import { Redis } from "@upstash/redis";

// Create Redis client for real-time stage updates via SSE
let redisInstance: Redis | null = null;

function getRedis(): Redis {
  if (!redisInstance) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error(
        "Missing Upstash Redis credentials. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env"
      );
    }

    redisInstance = new Redis({
      url,
      token,
    });
  }

  return redisInstance;
}

// Export singleton instance as default
export const redis = getRedis();
export { getRedis };
