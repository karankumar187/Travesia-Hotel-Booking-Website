/**
 * Cache helpers backed by Redis (Upstash REST API via fetch).
 * All functions silently no-op when Redis is not configured.
 */
import { redisGet, redisSet, redisDel, redisDelPattern } from "../configs/redis.js";

export const cacheGet = async (key) => {
  try { return await redisGet(key); }
  catch (e) { console.warn(`[Cache] GET "${key}":`, e.message); return null; }
};

export const cacheSet = async (key, value, ttl) => {
  try { await redisSet(key, value, ttl); }
  catch (e) { console.warn(`[Cache] SET "${key}":`, e.message); }
};

export const cacheDel = async (keys) => {
  try {
    const list = Array.isArray(keys) ? keys : [keys];
    if (list.length) await redisDel(...list);
  } catch (e) { console.warn("[Cache] DEL:", e.message); }
};

export const cacheDelPattern = async (pattern) => {
  try { await redisDelPattern(pattern); }
  catch (e) { console.warn(`[Cache] DEL pattern "${pattern}":`, e.message); }
};

// ─── Cache key builders ────────────────────────────────────────────────────────
export const KEYS = {
  rooms:            () => "tv:rooms:all",
  roomsByHotel:     (id) => `tv:rooms:hotel:${id}`,
  cities:           () => "tv:hotels:cities",
  recentReviews:    (limit) => `tv:reviews:recent:${limit}`,
  roomReviews:      (roomId) => `tv:reviews:room:${roomId}`,
  hotelReviewStats: (id) => `tv:reviews:stats:hotel:${id}`,
};

// ─── TTLs (seconds) ────────────────────────────────────────────────────────────
export const TTL = {
  rooms:            300,   // 5 min
  cities:           600,   // 10 min
  recentReviews:    60,    // 1 min
  roomReviews:      120,   // 2 min
  hotelReviewStats: 120,   // 2 min
};
