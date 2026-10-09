/**
 * In-memory sliding-window rate limiter. Fine for a single Node process /
 * local dev; production deployments should back this with Redis (see
 * REDIS_URL) so limits hold across horizontally-scaled instances.
 */
const buckets = new Map<string, number[]>();
const MAX_KEYS = 10_000;
const MAX_WINDOW_MS = 10 * 60_000;

/** Bounds memory: drops keys with no recent hits, then the oldest keys if still over the cap. */
function prune(now: number) {
  for (const [key, hits] of buckets) {
    if (!hits.length || hits[hits.length - 1] < now - MAX_WINDOW_MS) buckets.delete(key);
  }
  while (buckets.size > MAX_KEYS) buckets.delete(buckets.keys().next().value as string);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  if (buckets.size > MAX_KEYS) prune(now);
  const windowStart = now - windowMs;
  const hits = (buckets.get(key) ?? []).filter((t) => t > windowStart);

  if (hits.length >= limit) {
    buckets.set(key, hits);
    return { allowed: false, remaining: 0, resetMs: hits[0] + windowMs - now };
  }

  hits.push(now);
  buckets.set(key, hits);
  return { allowed: true, remaining: limit - hits.length, resetMs: windowMs };
}

/** The client IP as seen by the reverse proxy in front of this app. The proxy appends the
 *  address it received the connection from to X-Forwarded-For, so the LAST entry is the one a
 *  visitor can't forge — the first entry is whatever the visitor sent, and keying on it let
 *  anyone dodge every limit by sending a random X-Forwarded-For per request. */
export function clientKeyFromRequest(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const last = forwarded?.split(",").map((s) => s.trim()).filter(Boolean).pop();
  return last || req.headers.get("x-real-ip")?.trim() || "anonymous";
}
