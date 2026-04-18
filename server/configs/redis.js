/**
 * Upstash Redis client using the REST API directly via fetch().
 * NO npm package — avoids all Vercel serverless bundling issues.
 *
 * The Upstash REST API accepts commands as JSON arrays:
 *   POST / → body: ["SET", "key", "value", "EX", "300"]
 *   POST / → body: ["GET", "key"]
 *
 * Setup:
 *   1. https://console.upstash.com → Create database → REST API tab
 *   2. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env
 *   3. Add same vars to Vercel project settings
 */

const REDIS_URL   = (process.env.UPSTASH_REDIS_REST_URL   || "").trim();
const REDIS_TOKEN = (process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();

const isConfigured = Boolean(REDIS_URL && REDIS_TOKEN);

if (isConfigured) {
  console.log("✅ Redis (Upstash REST) configured");
} else {
  console.warn("⚠️  Redis not configured — caching disabled");
}

/**
 * Execute a single Redis command via HTTP fetch.
 * Returns the result or null on any error.
 */
const exec = async (...args) => {
  if (!isConfigured) return null;
  try {
    const res = await fetch(REDIS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.result ?? null;
  } catch (err) {
    console.warn("[Redis] fetch error:", err.message);
    return null;
  }
};

// ─── Public API ────────────────────────────────────────────────────────────────

/** Get and JSON-parse a cached value. Returns null on miss or error. */
export const redisGet = async (key) => {
  const raw = await exec("GET", key);
  if (raw === null) return null;
  try { return JSON.parse(raw); } catch { return raw; }
};

/** Set a JSON-serialised value with a TTL in seconds. */
export const redisSet = async (key, value, ttlSeconds) => {
  await exec("SET", key, JSON.stringify(value), "EX", String(ttlSeconds));
};

/** Delete one or more keys. */
export const redisDel = async (...keys) => {
  if (keys.length === 0) return;
  await exec("DEL", ...keys);
};

/**
 * Delete all keys matching a glob pattern using SCAN.
 * Safe for large key spaces — processes in batches of 100.
 */
export const redisDelPattern = async (pattern) => {
  if (!isConfigured) return;
  let cursor = "0";
  do {
    const result = await exec("SCAN", cursor, "MATCH", pattern, "COUNT", "100");
    if (!result) break;
    [cursor] = result;
    const keys = result[1];
    if (keys?.length) await exec("DEL", ...keys);
  } while (cursor !== "0");
};

export default { redisGet, redisSet, redisDel, redisDelPattern, isConfigured };
