/**
 * Test helpers for TTS API route tests
 */

import { NextRequest } from 'next/server';

/**
 * Create a NextRequest for testing
 * Works around NextRequest construction issues in test environment
 */
export function createTestRequest(
  url: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string | Record<string, unknown>;
  }
): NextRequest {
  const headers = new Headers(init?.headers || {});
  const body = typeof init?.body === 'string' ? init.body : JSON.stringify(init?.body || {});

  // Create a base Request first
  const request = new Request(url, {
    method: init?.method || 'POST',
    headers,
    body: init?.method === 'GET' ? undefined : body,
  });

  // Cast to NextRequest - in tests, the base Request interface is sufficient
  return request as unknown as NextRequest;
}
