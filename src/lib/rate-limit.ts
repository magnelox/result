interface RateLimitStore {
  [key: string]: { count: number; expiresAt: number };
}

const memoryStore: RateLimitStore = {};

/**
 * In-memory sliding window rate limiter fallback
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 60,
  windowSeconds: number = 60
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const key = `ratelimit:${identifier}`;

  // Clean up expired keys periodically
  if (Math.random() < 0.05) {
    for (const k in memoryStore) {
      if (memoryStore[k].expiresAt < now) {
        delete memoryStore[k];
      }
    }
  }

  const record = memoryStore[key];

  if (!record || record.expiresAt < now) {
    memoryStore[key] = {
      count: 1,
      expiresAt: now + windowMs,
    };
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: Math.ceil((now + windowMs) / 1000),
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.ceil(record.expiresAt / 1000),
    };
  }

  record.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - record.count,
    reset: Math.ceil(record.expiresAt / 1000),
  };
}
