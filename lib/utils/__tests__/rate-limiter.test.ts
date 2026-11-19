/**
 * Tests for rate limiter utility
 */

import { ttsRateLimiter, getClientIp } from '../rate-limiter';
import { NextRequest } from 'next/server';

describe('rate-limiter', () => {
  beforeEach(() => {
    // Reset rate limiter state between tests
    ttsRateLimiter.reset();
  });

  afterAll(() => {
    // Clean up interval
    ttsRateLimiter.destroy();
  });

  describe('ttsRateLimiter', () => {
    it('should allow requests under the limit', () => {
      const result = ttsRateLimiter.check('192.168.1.1');
      expect(result.allowed).toBe(true);
      expect(result.retryAfter).toBeUndefined();
    });

    it('should track multiple IPs independently', () => {
      const ip1Result = ttsRateLimiter.check('192.168.1.1');
      const ip2Result = ttsRateLimiter.check('192.168.1.2');

      expect(ip1Result.allowed).toBe(true);
      expect(ip2Result.allowed).toBe(true);
    });

    it('should block requests exceeding per-IP limit', () => {
      const ip = '192.168.1.1';

      // Make 100 requests (the limit)
      for (let i = 0; i < 100; i++) {
        const result = ttsRateLimiter.check(ip);
        expect(result.allowed).toBe(true);
      }

      // 101st request should be blocked
      const blockedResult = ttsRateLimiter.check(ip);
      expect(blockedResult.allowed).toBe(false);
      expect(blockedResult.retryAfter).toBeGreaterThan(0);
    });

    it('should block requests exceeding global limit', () => {
      // Use different IPs to avoid per-IP limit
      for (let i = 0; i < 1000; i++) {
        const result = ttsRateLimiter.check(`192.168.1.${i % 255}`);
        expect(result.allowed).toBe(true);
      }

      // 1001st request should be blocked by global limit
      const blockedResult = ttsRateLimiter.check('192.168.1.250');
      expect(blockedResult.allowed).toBe(false);
      expect(blockedResult.retryAfter).toBeGreaterThan(0);
    });

    it('should provide retryAfter in seconds', () => {
      const ip = '192.168.1.1';

      // Exhaust the limit
      for (let i = 0; i < 100; i++) {
        ttsRateLimiter.check(ip);
      }

      const blockedResult = ttsRateLimiter.check(ip);
      expect(blockedResult.allowed).toBe(false);
      expect(blockedResult.retryAfter).toBeGreaterThan(0);
      expect(blockedResult.retryAfter).toBeLessThanOrEqual(15 * 60); // Max window size
    });
  });

  describe('getClientIp', () => {
    function createMockRequest(headers: Record<string, string>): Request {
      return {
        headers: {
          get: (name: string) => headers[name] || null,
        },
      } as Request;
    }

    it('should extract IP from x-forwarded-for header', () => {
      const request = createMockRequest({
        'x-forwarded-for': '203.0.113.1, 198.51.100.1',
      });

      expect(getClientIp(request)).toBe('203.0.113.1');
    });

    it('should extract IP from x-real-ip header', () => {
      const request = createMockRequest({
        'x-real-ip': '203.0.113.2',
      });

      expect(getClientIp(request)).toBe('203.0.113.2');
    });

    it('should extract IP from cf-connecting-ip header', () => {
      const request = createMockRequest({
        'cf-connecting-ip': '203.0.113.3',
      });

      expect(getClientIp(request)).toBe('203.0.113.3');
    });

    it('should prioritize x-forwarded-for over other headers', () => {
      const request = createMockRequest({
        'x-forwarded-for': '203.0.113.1',
        'x-real-ip': '203.0.113.2',
        'cf-connecting-ip': '203.0.113.3',
      });

      expect(getClientIp(request)).toBe('203.0.113.1');
    });

    it('should return "unknown" when no headers present', () => {
      const request = createMockRequest({});
      expect(getClientIp(request)).toBe('unknown');
    });

    it('should handle x-forwarded-for with single IP', () => {
      const request = createMockRequest({
        'x-forwarded-for': '203.0.113.1',
      });

      expect(getClientIp(request)).toBe('203.0.113.1');
    });

    it('should trim whitespace from x-forwarded-for', () => {
      const request = createMockRequest({
        'x-forwarded-for': ' 203.0.113.1 , 198.51.100.1 ',
      });

      expect(getClientIp(request)).toBe('203.0.113.1');
    });
  });
});
