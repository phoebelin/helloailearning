// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Polyfill Web APIs for Next.js API route tests
import { Request as FetchRequest, Response as FetchResponse, Headers as FetchHeaders, fetch } from 'whatwg-fetch'

// Create a proper Headers class
class ExtendedHeaders extends FetchHeaders {
  constructor(init) {
    super(init)
  }
}

// Extend Response with json and other static methods
class ExtendedResponse extends FetchResponse {
  constructor(body, init) {
    super(body, init)
  }

  static json(data, init) {
    const responseInit = init || {}
    const headers = new ExtendedHeaders(responseInit.headers || {})
    headers.set('Content-Type', 'application/json')
    
    return new ExtendedResponse(JSON.stringify(data), {
      ...responseInit,
      headers: headers,
    })
  }

  static redirect(url, status) {
    return new ExtendedResponse(null, {
      status: status || 302,
      headers: { Location: url },
    })
  }

  static error() {
    const response = new ExtendedResponse(null, { status: 0, statusText: '' })
    return response
  }
}

// Extend Request class
class ExtendedRequest extends FetchRequest {
  constructor(input, init) {
    super(input, init)
  }
}

if (typeof globalThis.Request === 'undefined') {
  globalThis.Request = ExtendedRequest
}
if (typeof globalThis.Response === 'undefined') {
  globalThis.Response = ExtendedResponse
}
if (typeof globalThis.Headers === 'undefined') {
  globalThis.Headers = ExtendedHeaders
}
if (typeof globalThis.fetch === 'undefined') {
  globalThis.fetch = fetch
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

