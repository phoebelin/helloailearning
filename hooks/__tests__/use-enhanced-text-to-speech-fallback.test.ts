/**
 * Tests for useEnhancedTextToSpeech Web Speech API fallback behavior
 * 
 * Verifies that the hook falls back to Web Speech API on various error responses
 * from the TTS endpoint (403, 429, 400, 500).
 */

import { renderHook, waitFor } from '@testing-library/react'
import { useEnhancedTextToSpeech } from '../use-enhanced-text-to-speech'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock Audio for testing audio playback errors
class MockAudio {
  src: string = ''
  onloadstart: (() => void) | null = null
  onended: (() => void) | null = null
  onerror: ((event: any) => void) | null = null
  currentTime: number = 0

  constructor(src?: string) {
    if (src) this.src = src
  }

  async play() {
    // Trigger onerror for invalid audio data test
    if (this.src.includes('base64') && this.onerror) {
      setTimeout(() => this.onerror?.({ type: 'error' }), 10)
    }
  }

  pause() {}
}

// @ts-ignore
global.Audio = MockAudio

// Mock SpeechSynthesisUtterance
class MockSpeechSynthesisUtterance {
  text: string
  lang: string = 'en-US'
  pitch: number = 1
  rate: number = 1
  volume: number = 1
  voice: any = null
  onstart: (() => void) | null = null
  onend: (() => void) | null = null
  onerror: ((event: any) => void) | null = null
  onpause: (() => void) | null = null
  onresume: (() => void) | null = null

  constructor(text: string) {
    this.text = text
  }
}

// @ts-ignore
global.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance

// Mock speechSynthesis
const mockSpeak = jest.fn()
const mockCancel = jest.fn()
const mockGetVoices = jest.fn(() => [])

Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: {
    speak: mockSpeak,
    cancel: mockCancel,
    getVoices: mockGetVoices,
    onvoiceschanged: null,
  },
})

describe('useEnhancedTextToSpeech - Fallback Behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fall back to Web Speech API on 403 Forbidden', async () => {
    // Mock 403 response from TTS endpoint
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      json: async () => ({ error: 'Forbidden: Invalid origin' }),
    })

    const { result } = renderHook(() =>
      useEnhancedTextToSpeech({ useGoogleCloud: true })
    )

    // Wait for Google Cloud check to complete
    await waitFor(() => {
      expect(result.current.isGoogleCloudChecked).toBe(true)
    })

    // Attempt to speak using Google Cloud TTS
    result.current.speak('Test text')

    // Wait for fallback to Web Speech API
    await waitFor(() => {
      expect(mockSpeak).toHaveBeenCalled()
    })

    // Verify Web Speech API was called
    expect(mockSpeak).toHaveBeenCalledTimes(1)
    const utterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).toBe('Test text')
  })

  it('should fall back to Web Speech API on 429 Too Many Requests', async () => {
    // Mock 429 response from TTS endpoint
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      json: async () => ({ error: 'Too many requests. Please try again later.' }),
    })

    const { result } = renderHook(() =>
      useEnhancedTextToSpeech({ useGoogleCloud: true })
    )

    await waitFor(() => {
      expect(result.current.isGoogleCloudChecked).toBe(true)
    })

    result.current.speak('Test text')

    await waitFor(() => {
      expect(mockSpeak).toHaveBeenCalled()
    })

    expect(mockSpeak).toHaveBeenCalledTimes(1)
    const utterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).toBe('Test text')
  })

  it('should fall back to Web Speech API on 400 Bad Request (invalid options)', async () => {
    // Mock 400 response from TTS endpoint
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({ error: "Invalid options: Language 'fr-FR' is not allowed" }),
    })

    const { result } = renderHook(() =>
      useEnhancedTextToSpeech({ useGoogleCloud: true })
    )

    await waitFor(() => {
      expect(result.current.isGoogleCloudChecked).toBe(true)
    })

    result.current.speak('Test text')

    await waitFor(() => {
      expect(mockSpeak).toHaveBeenCalled()
    })

    expect(mockSpeak).toHaveBeenCalledTimes(1)
    const utterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).toBe('Test text')
  })

  it('should fall back to Web Speech API on 500 Internal Server Error', async () => {
    // Mock 500 response from TTS endpoint
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ error: 'Failed to synthesize speech' }),
    })

    const { result } = renderHook(() =>
      useEnhancedTextToSpeech({ useGoogleCloud: true })
    )

    await waitFor(() => {
      expect(result.current.isGoogleCloudChecked).toBe(true)
    })

    result.current.speak('Test text')

    await waitFor(() => {
      expect(mockSpeak).toHaveBeenCalled()
    })

    expect(mockSpeak).toHaveBeenCalledTimes(1)
    const utterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).toBe('Test text')
  })

  it('should fall back to Web Speech API on network error', async () => {
    // Mock network error
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() =>
      useEnhancedTextToSpeech({ useGoogleCloud: true })
    )

    await waitFor(() => {
      expect(result.current.isGoogleCloudChecked).toBe(true)
    })

    result.current.speak('Test text')

    await waitFor(() => {
      expect(mockSpeak).toHaveBeenCalled()
    })

    expect(mockSpeak).toHaveBeenCalledTimes(1)
    const utterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).toBe('Test text')
  })

  it('should fall back to Web Speech API when audio playback fails', async () => {
    // Mock successful response with valid audio data, but audio playback will fail
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        audioData: 'base64encodeddata',
        mimeType: 'audio/mpeg',
      }),
    })

    const { result } = renderHook(() =>
      useEnhancedTextToSpeech({ useGoogleCloud: true })
    )

    await waitFor(() => {
      expect(result.current.isGoogleCloudChecked).toBe(true)
    })

    result.current.speak('Test text')

    // Wait for fallback to Web Speech API (triggered by audio error)
    await waitFor(() => {
      expect(mockSpeak).toHaveBeenCalled()
    }, { timeout: 3000 })

    expect(mockSpeak).toHaveBeenCalledTimes(1)
    const utterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).toBe('Test text')
  })

  it('should not block fallback even if onError is provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      json: async () => ({ error: 'Forbidden' }),
    })

    const onError = jest.fn()

    const { result } = renderHook(() =>
      useEnhancedTextToSpeech({ useGoogleCloud: true })
    )

    await waitFor(() => {
      expect(result.current.isGoogleCloudChecked).toBe(true)
    })

    result.current.speak('Test text', { onError })

    // Wait for fallback to Web Speech API
    await waitFor(() => {
      expect(mockSpeak).toHaveBeenCalled()
    })

    // Verify Web Speech API was called even with onError present
    expect(mockSpeak).toHaveBeenCalledTimes(1)
    const utterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).toBe('Test text')
  })
})
