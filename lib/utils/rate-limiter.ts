/**
 * In-memory rate limiter for API endpoints
 * 
 * Note: In serverless environments (Vercel, AWS Lambda), each function instance
 * maintains its own in-memory state. This means rate limits are enforced per
 * instance rather than globally. While not perfect, this still provides effective
 * protection:
 * - Single-source attacks are rate-limited effectively
 * - Distributed attacks hit multiple instances, but each enforces its limit
 * - Reduces load and cost even if not perfectly consistent
 * 
 * For stricter guarantees, consider Redis or a similar shared store.
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

class RateLimiter {
  private ipLimits: Map<string, RateLimitEntry> = new Map();
  private globalCount = 0;
  private globalWindowStart = Date.now();
  private config: RateLimitConfig;
  private globalConfig: RateLimitConfig;
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    config: RateLimitConfig,
    globalConfig: RateLimitConfig
  ) {
    this.config = config;
    this.globalConfig = globalConfig;

    // Clean up stale entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if a request is allowed for the given IP
   * Returns { allowed: true } or { allowed: false, retryAfter: seconds }
   */
  check(ip: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();

    // Check global limit first (per-instance backstop)
    if (now - this.globalWindowStart > this.globalConfig.windowMs) {
      // Reset global window
      this.globalCount = 0;
      this.globalWindowStart = now;
    }

    if (this.globalCount >= this.globalConfig.maxRequests) {
      const retryAfter = Math.ceil(
        (this.globalWindowStart + this.globalConfig.windowMs - now) / 1000
      );
      return { allowed: false, retryAfter };
    }

    // Check per-IP limit
    const entry = this.ipLimits.get(ip);

    if (!entry || now - entry.windowStart > this.config.windowMs) {
      // Start new window
      this.ipLimits.set(ip, { count: 1, windowStart: now });
      this.globalCount++;
      return { allowed: true };
    }

    if (entry.count >= this.config.maxRequests) {
      const retryAfter = Math.ceil(
        (entry.windowStart + this.config.windowMs - now) / 1000
      );
      return { allowed: false, retryAfter };
    }

    // Increment counters
    entry.count++;
    this.globalCount++;
    return { allowed: true };
  }

  /**
   * Remove stale entries to prevent memory leaks
   */
  private cleanup() {
    const now = Date.now();
    const staleThreshold = now - this.config.windowMs;

    for (const [ip, entry] of this.ipLimits.entries()) {
      if (entry.windowStart < staleThreshold) {
        this.ipLimits.delete(ip);
      }
    }
  }

  /**
   * Clear all rate limit data (useful for testing)
   */
  reset() {
    this.ipLimits.clear();
    this.globalCount = 0;
    this.globalWindowStart = Date.now();
  }

  /**
   * Clean up interval on shutdown
   */
  destroy() {
    clearInterval(this.cleanupInterval);
  }
}

/**
 * TTS-specific rate limiter
 * 
 * Limits chosen to be generous for legitimate use while protecting against abuse:
 * 
 * - Per-IP: 600 requests per 15 minutes (40 req/min average)
 *   Accounts for shared IPs (classrooms, households, offices):
 *   - Classroom of 30 students: Each can do ~20 TTS requests in 15 min (2-4 lessons)
 *   - Household with 5 people: Each can do ~120 TTS requests (12-24 lessons)
 *   - Single user: Can do 60 lessons in 15 min without hitting the limit
 *   
 *   This is very generous for legitimate use while still preventing abuse.
 * 
 * - Global per-instance: 3000 requests per 15 minutes (200 req/min)
 *   Bill-protection backstop for a single serverless instance.
 *   Supports ~75 concurrent classroom users or ~300 individual users at typical pace.
 *   
 *   Note: In serverless environments, multiple instances may run simultaneously,
 *   each with its own 3000 req/15min limit. Total capacity scales with traffic.
 */
export const ttsRateLimiter = new RateLimiter(
  {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 600,
  },
  {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 3000,
  }
);

/**
 * Extract client IP from request, handling proxies and edge cases
 */
export function getClientIp(request: Request): string {
  // Try standard headers in order of preference
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can be a comma-separated list, take the first (client)
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback for local development or direct connections
  return 'unknown';
}
