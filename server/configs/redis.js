/**
 * Redis cache client — uses Upstash HTTP-based Redis.
 * Upstash works in serverless (Vercel) because it uses fetch() instead
 * of a persistent TCP connection (which breaks on serverless cold starts).
 *
 * Setup:
 *   1. Go to https://console.upstash.com → Create a database
 *   2. Copy "UPSTASH_REDIS_REST_URL" and "UPSTASH_REDIS_REST_TOKEN"
 *   3. Add both to your .env and Vercel project env vars
 */
import { Redis } from "@upstash/redis";

let redisClient = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  console.log("✅ Redis (Upstash) client initialized");
} else {
  console.warn("⚠️  Redis not configured — caching disabled. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env");
}

export default redisClient;
