/**
 * Redis cache helpers.
 * All functions use the lazy getRedis() initializer — no module-level I/O.
 * Silently no-op when Redis is unavailable.
 */
import { getRedis } from "./redis.js";

// ─── Core helpers ─────────────────────────────────────────────────────────────

export const cacheGet = async (key) => {
  try {
    const redis = await getRedis();
    if (!redis) return null;
    return await redis.get(key);
  } catch (err) {
    console.warn(`[Cache] GET error "${key}":`, err.message);
    return null;
  }
};

export const cacheSet = async (key, value, ttlSeconds) => {
  try {
    const redis = await getRedis();
    if (!redis) return;
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (err) {
    console.warn(`[Cache] SET error "${key}":`, err.message);
  }
};

export const cacheDel = async (keys) => {
  try {
    const redis = await getRedis();
    if (!redis) return;
    const list = Array.isArray(keys) ? keys : [keys];
    await Promise.all(list.map((k) => redis.del(k)));
  } catch (err) {
    console.warn("[Cache] DEL error:", err.message);
  }
};

export const cacheDelPattern = async (pattern) => {
  try {
    const redis = await getRedis();
    if (!redis) return;
    let cursor = 0;
    do {
      const [nextCursor, keys] = await redis.scan(cursor, { match: pattern, count: 100 });
      cursor = nextCursor;
      if (keys.length > 0) await Promise.all(keys.map((k) => redis.del(k)));
    } while (cursor !== 0);
  } catch (err) {
    console.warn(`[Cache] Pattern DEL error "${pattern}":`, err.message);
  }
};

// ─── Cache key builders ────────────────────────────────────────────────────────
export const KEYS = {
  rooms:            () => "travesia:rooms:all",
  roomsByHotel:     (id) => `travesia:rooms:hotel:${id}`,
  cities:           () => "travesia:hotels:cities",
  recentReviews:    (limit) => `travesia:reviews:recent:${limit}`,
  roomReviews:      (roomId) => `travesia:reviews:room:${roomId}`,
  hotelReviewStats: (id) => `travesia:reviews:stats:hotel:${id}`,
};

// ─── TTLs (seconds) ────────────────────────────────────────────────────────────
export const TTL = {
  rooms:            300,
  cities:           600,
  recentReviews:    60,
  roomReviews:      120,
  hotelReviewStats: 120,
};
