/**
 * Redis cache helpers.
 *
 * All functions silently no-op if Redis is not configured, so the app
 * degrades gracefully to direct DB calls without any code changes.
 *
 * Cache key namespacing: "travesia:<collection>:<id>"
 * TTLs (seconds):
 *   - Rooms list          → 300  (5 min)
 *   - Single room         → 300
 *   - Hotel rooms list    → 300
 *   - Recent reviews      → 60   (1 min — testimonials poll every 30s)
 *   - Room reviews        → 120  (2 min)
 *   - Hotel cities        → 600  (10 min — rarely changes)
 *   - Hotel review stats  → 120
 */
import redis from "./redis.js";

// ─── Core helpers ─────────────────────────────────────────────────────────────

/**
 * Get a cached value. Returns null on any error (cache miss treated as safe).
 */
export const cacheGet = async (key) => {
  if (!redis) return null;
  try {
    const value = await redis.get(key);
    return value;          // Upstash auto-parses JSON
  } catch (err) {
    console.warn(`[Cache] GET error for "${key}":`, err.message);
    return null;
  }
};

/**
 * Set a cached value with a TTL (seconds).
 */
export const cacheSet = async (key, value, ttlSeconds) => {
  if (!redis) return;
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (err) {
    console.warn(`[Cache] SET error for "${key}":`, err.message);
  }
};

/**
 * Delete one or more cache keys (e.g., on write/update).
 * Accepts a string or array of strings.
 */
export const cacheDel = async (keys) => {
  if (!redis) return;
  const list = Array.isArray(keys) ? keys : [keys];
  try {
    await Promise.all(list.map((k) => redis.del(k)));
    console.log(`[Cache] Invalidated: ${list.join(", ")}`);
  } catch (err) {
    console.warn("[Cache] DEL error:", err.message);
  }
};

/**
 * Delete all keys matching a pattern using SCAN (safe for large keyspaces).
 * E.g., "travesia:rooms:*"
 */
export const cacheDelPattern = async (pattern) => {
  if (!redis) return;
  try {
    let cursor = 0;
    do {
      const [nextCursor, keys] = await redis.scan(cursor, { match: pattern, count: 100 });
      cursor = nextCursor;
      if (keys.length > 0) {
        await Promise.all(keys.map((k) => redis.del(k)));
        console.log(`[Cache] Pattern-invalidated ${keys.length} keys matching "${pattern}"`);
      }
    } while (cursor !== 0);
  } catch (err) {
    console.warn(`[Cache] Pattern DEL error for "${pattern}":`, err.message);
  }
};

// ─── Cache key builders ────────────────────────────────────────────────────────
export const KEYS = {
  rooms:              () => "travesia:rooms:all",
  roomsByHotel:       (hotelId) => `travesia:rooms:hotel:${hotelId}`,
  cities:             () => "travesia:hotels:cities",
  recentReviews:      (limit) => `travesia:reviews:recent:${limit}`,
  roomReviews:        (roomId) => `travesia:reviews:room:${roomId}`,
  hotelReviewStats:   (hotelId) => `travesia:reviews:stats:hotel:${hotelId}`,
};

// ─── TTLs (seconds) ────────────────────────────────────────────────────────────
export const TTL = {
  rooms:              300,
  cities:             600,
  recentReviews:      60,
  roomReviews:        120,
  hotelReviewStats:   120,
};
