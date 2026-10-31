interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory token bucket store with automatic cleanup
const ipStore = new Map<string, RateLimitEntry>();
const accountStore = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL_MS = 60 * 1000;

setInterval(() => {
  const now = Date.now();
  ipStore.forEach((val, key) => {
    if (val.resetAt < now) ipStore.delete(key);
  });
  accountStore.forEach((val, key) => {
    if (val.resetAt < now) accountStore.delete(key);
  });
}, CLEANUP_INTERVAL_MS);

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetInSeconds: number;
}

export function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number,
  type: 'ip' | 'account' = 'ip'
): RateLimitResult {
  const store = type === 'ip' ? ipStore : accountStore;
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || entry.resetAt < now) {
    store.set(identifier, {
      count: 1,
      resetAt: now + windowSeconds * 1000,
    });
    return {
      success: true,
      remaining: limit - 1,
      resetInSeconds: windowSeconds,
    };
  }

  if (entry.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetInSeconds: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  return {
    success: true,
    remaining: limit - entry.count,
    resetInSeconds: Math.ceil((entry.resetAt - now) / 1000),
  };
}
