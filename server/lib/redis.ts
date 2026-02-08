import Redis from "ioredis";

// Create Redis client for real-time stage updates via SSE
let redisInstance: Redis | null = null;

function getRedis(): Redis {
  if (!redisInstance) {
    const url = process.env.REDIS_URL;

    if (!url) {
      throw new Error(
        "Missing REDIS_URL. Please set it in .env"
      );
    }

    redisInstance = new Redis(url);
  }

  return redisInstance;
}

// Export singleton instance as default
export const redis = getRedis();
export { getRedis };
