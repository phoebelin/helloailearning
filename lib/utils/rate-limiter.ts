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
 * Limits chosen to be generous for legitimate use:
 * - Per-IP: 100 requests per 15 minutes (6.67 req/min average)
 *   A typical lesson has 5-10 TTS calls. Moving through 10 lessons in 15 minutes
 *   would use ~100 requests. This allows rapid exploration without blocking learners.
 * 
 * - Global per-instance: 1000 requests per 15 minutes
 *   Protects against bill runaway if a single instance is hammered.
 *   ~67 req/min sustained, ~15 concurrent users at typical lesson pace.
 */
export const ttsRateLimiter = new RateLimiter(
  {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
  {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000,
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
