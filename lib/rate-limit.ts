interface RateLimitRecord {
  timestamps: number[];
}

// In-memory sliding window rate limiter
const ipMap = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    ipMap.forEach((record, key) => {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 10 * 60 * 1000);
      if (record.timestamps.length === 0) {
        ipMap.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  let record = ipMap.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    ipMap.set(identifier, record);
  }

  // Remove timestamps outside the sliding window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= limit) {
    const oldestTimestamp = record.timestamps[0] || now;
    const resetTime = Math.ceil((oldestTimestamp + windowMs - now) / 1000);
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.max(resetTime, 1),
    };
  }

  record.timestamps.push(now);
  return {
    success: true,
    limit,
    remaining: limit - record.timestamps.length,
    reset: Math.ceil(windowMs / 1000),
  };
}

export function getClientIp(req: Request): string {
  const headers = req.headers;
  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0];
    if (firstIp) return firstIp.trim();
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}
