/**
 * Redis cache client — uses Upstash HTTP-based Redis.
 * Upstash works in serverless (Vercel) because it uses fetch() instead
 * of a persistent TCP connection (which breaks on serverless cold starts).
 *
 * Setup:
 *   1. Go to https://console.upstash.com → Create a database
 *   2. Copy "UPSTASH_REDIS_REST_URL" and "UPSTASH_REDIS_REST_TOKEN"
 *   3. Add both to your .env and Vercel project env vars
 *
 * Graceful degradation: if env vars are missing/invalid, redisClient = null
 * and all cache helpers silently no-op (app falls through to MongoDB).
 */
import { Redis } from "@upstash/redis";

const redisUrl = (process.env.UPSTASH_REDIS_REST_URL || "").trim();
const redisToken = (process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();

let redisClient = null;

if (redisUrl && redisToken) {
  try {
    redisClient = new Redis({ url: redisUrl, token: redisToken });
    console.log("✅ Redis (Upstash) client initialized");
  } catch (err) {
    console.warn("⚠️  Redis init failed (caching disabled):", err.message);
    redisClient = null;
  }
} else {
  console.warn("⚠️  Redis not configured — caching disabled. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env");
}

export default redisClient;
