/* GabomaGPT · Rate Limiting · SmartANDJ AI Technologies
   Upstash sliding window rate limiter
   Fondateur : Daniel Jonathan ANDJ */

import { Ratelimit } from '@upstash/ratelimit';
import { getRedis } from './redis';

// ── Rate limiters by tier ───────────────────────────────────

/** Free tier: 10 requests per minute */
export const freeLimiter = new Ratelimit({
  redis: getRedis(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true,
  prefix: 'gaboma:rl:free',
});

/** Pro tier: 60 requests per minute */
export const proLimiter = new Ratelimit({
  redis: getRedis(),
  limiter: Ratelimit.slidingWindow(60, '1 m'),
  analytics: true,
  prefix: 'gaboma:rl:pro',
});

/** Admin tier: 200 requests per minute */
export const adminLimiter = new Ratelimit({
  redis: getRedis(),
  limiter: Ratelimit.slidingWindow(200, '1 m'),
  analytics: true,
  prefix: 'gaboma:rl:admin',
});

/** IP-based limiter for public routes: 30 requests per minute */
export const ipLimiter = new Ratelimit({
  redis: getRedis(),
  limiter: Ratelimit.slidingWindow(30, '1 m'),
  analytics: true,
  prefix: 'gaboma:rl:ip',
});

// ── Helper ──────────────────────────────────────────────────

export function getLimiterForRole(role: string): Ratelimit {
  switch (role) {
    case 'admin':
      return adminLimiter;
    case 'pro':
      return proLimiter;
    default:
      return freeLimiter;
  }
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/** Check rate limit for a user */
export async function checkRateLimit(
  identifier: string,
  role: string = 'free'
): Promise<RateLimitResult> {
  const limiter = getLimiterForRole(role);
  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
