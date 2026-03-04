import Redis from "ioredis";

// Create Redis client for real-time stage updates via SSE
let redisInstance: Redis | null = null;

function getRedis(): Redis {
  if (!redisInstance) {
    const config = useRuntimeConfig();
    const url = config.private.redisUrl;

    if (!url) {
      throw new Error(
        "Missing REDIS_URL. Please set it in .env"
      );
    }

    redisInstance = new Redis(url);
  }

  return redisInstance;
}

// Export getter function - lazy initialization
export { getRedis };
