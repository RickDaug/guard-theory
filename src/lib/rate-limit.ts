/**
 * A fixed-window rate limiter held in process memory.
 *
 * Honest about what it is: this survives neither a restart nor a second
 * instance, so it raises the cost of casual abuse rather than providing real
 * protection. When the site is deployed to more than one instance this must be
 * replaced with a shared store. Recorded in docs/assumptions.md.
 */

type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

/** Keeps the map from growing without bound on a long-running instance. */
function sweep(now: number): void {
  if (windows.size < 5_000) return;
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}

export type RateLimitResult = {
  allowed: boolean;
  /** Seconds until the window resets. Only meaningful when not allowed. */
  retryAfterSeconds: number;
};

export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  existing.count += 1;

  if (existing.count > limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/** Test seam. Not exported through any route. */
export function resetRateLimits(): void {
  windows.clear();
}
