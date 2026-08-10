/* GabomaGPT · Upstash Redis Client · SmartANDJ AI Technologies
   Cache, rate limiting, queues, token counting
   Fondateur : Daniel Jonathan ANDJ */

import { Redis } from '@upstash/redis';

// ── Singleton Redis client ──────────────────────────────────
let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redis;
}

// ══════════════════════════════════════════════════════════
// CACHE HELPERS
// ══════════════════════════════════════════════════════════

/** Cache a value with TTL (seconds) */
export async function cacheSet(key: string, value: unknown, ttlSeconds = 3600): Promise<void> {
  const r = getRedis();
  await r.set(`gaboma:${key}`, JSON.stringify(value), { ex: ttlSeconds });
}

/** Get a cached value */
export async function cacheGet<T = unknown>(key: string): Promise<T | null> {
  const r = getRedis();
  const val = await r.get(`gaboma:${key}`);
  if (val === null) return null;
  return (typeof val === 'string' ? JSON.parse(val) : val) as T;
}

/** Invalidate a cache key */
export async function cacheInvalidate(key: string): Promise<void> {
  const r = getRedis();
  await r.del(`gaboma:${key}`);
}

// ══════════════════════════════════════════════════════════
// TOKEN COUNTING
// ══════════════════════════════════════════════════════════

/** Increment user token count */
export async function incrementTokens(userId: string, tokens: number): Promise<number> {
  const r = getRedis();
  const key = `gaboma:tokens:${userId}:${new Date().toISOString().slice(0, 10)}`;
  const newVal = await r.incrby(key, tokens);
  // Auto-expire daily counters after 48h
  await r.expire(key, 172800);
  return newVal;
}

/** Get user's daily token count */
export async function getDailyTokens(userId: string): Promise<number> {
  const r = getRedis();
  const key = `gaboma:tokens:${userId}:${new Date().toISOString().slice(0, 10)}`;
  return (await r.get<number>(key)) ?? 0;
}

// ══════════════════════════════════════════════════════════
// SESSION STATE
// ══════════════════════════════════════════════════════════

/** Store temporary session state */
export async function setSessionState(sessionId: string, state: unknown, ttlSeconds = 1800): Promise<void> {
  const r = getRedis();
  await r.set(`gaboma:session:${sessionId}`, JSON.stringify(state), { ex: ttlSeconds });
}

/** Get session state */
export async function getSessionState<T = unknown>(sessionId: string): Promise<T | null> {
  const r = getRedis();
  const val = await r.get(`gaboma:session:${sessionId}`);
  if (val === null) return null;
  return (typeof val === 'string' ? JSON.parse(val) : val) as T;
}
