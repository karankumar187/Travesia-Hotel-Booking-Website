/**
 * Redis cache client — Upstash HTTP-based Redis.
 * Uses dynamic import so ANY failure (bad package, missing native dep,
 * invalid env vars) is fully caught and never crashes the serverless function.
 */

const redisUrl   = (process.env.UPSTASH_REDIS_REST_URL   || "").trim();
const redisToken = (process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();

let redisClient = null;

if (redisUrl && redisToken) {
  try {
    // Dynamic import — catches failures at the IMPORT level too,
    // not just the constructor level.
    const { Redis } = await import("@upstash/redis");
    redisClient = new Redis({ url: redisUrl, token: redisToken });
    console.log("✅ Redis (Upstash) client initialized");
  } catch (err) {
    console.warn("⚠️  Redis init failed — caching disabled:", err.message);
    redisClient = null;
  }
} else {
  console.warn("⚠️  Redis not configured — caching disabled (set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN)");
}

export default redisClient;
