/**
 * Redis lazy initializer — NO top-level await.
 * Uses a module-level singleton that initializes on first cache call.
 * This ensures the module always loads successfully even if Upstash is
 * misconfigured; errors are isolated to individual cache operations.
 */

let _client = null;
let _initialized = false;

export const getRedis = async () => {
  if (_initialized) return _client;
  _initialized = true;

  const url   = (process.env.UPSTASH_REDIS_REST_URL   || "").trim();
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();

  if (!url || !token) {
    console.warn("⚠️  Redis not configured — caching disabled");
    return null;
  }

  try {
    const { Redis } = await import("@upstash/redis");
    _client = new Redis({ url, token });
    console.log("✅ Redis (Upstash) initialized");
  } catch (err) {
    console.warn("⚠️  Redis init failed — caching disabled:", err.message);
    _client = null;
  }

  return _client;
};

export default getRedis;
