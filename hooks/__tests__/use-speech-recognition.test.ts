/**
 * Tests for useSpeechRecognition hook
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useSpeechRecognition } from '../use-speech-recognition'

// Mock SpeechRecognition API
class MockSpeechRecognition {
  continuous = false
  interimResults = false
  lang = 'en-US'
  maxAlternatives = 1
  onstart: ((event: Event) => void) | null = null
  onend: ((event: Event) => void) | null = null
  onresult: ((event: any) => void) | null = null
  onerror: ((event: any) => void) | null = null

  start() {
    if (this.onstart) {
      this.onstart(new Event('start'))
    }
  }

  stop() {
    if (this.onend) {
      this.onend(new Event('end'))
    }
  }

  abort() {
    if (this.onend) {
      this.onend(new Event('end'))
    }
  }

  // Helper to trigger result event
  triggerResult(transcript: string, isFinal: boolean, confidence: number = 0.9) {
    if (this.onresult) {
      const mockEvent = {
        results: {
          length: 1,
          0: {
            length: 1,
            isFinal,
            0: {
              transcript,
              confidence,
            },
          },
        },
        resultIndex: 0,
      }
      this.onresult(mockEvent)
    }
  }

  // Helper to trigger error event
  triggerError(error: string) {
    if (this.onerror) {
      this.onerror({ error, message: error })
    }
  }
}

describe('useSpeechRecognition', () => {
  let mockRecognition: MockSpeechRecognition

  beforeEach(() => {
    mockRecognition = new MockSpeechRecognition()
    
    // Mock the global SpeechRecognition
    global.window.SpeechRecognition = jest.fn(() => mockRecognition) as any
    global.window.webkitSpeechRecognition = jest.fn(() => mockRecognition) as any
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useSpeechRecognition())

      expect(result.current.isListening).toBe(false)
      expect(result.current.transcript).toBe('')
      expect(result.current.interimTranscript).toBe('')
      expect(result.current.error).toBe(null)
      expect(result.current.isSupported).toBe(true)
      expect(result.current.hasPermission).toBe(null)
    })

    it('should detect when speech recognition is not supported', () => {
      delete (global.window as any).SpeechRecognition
      delete (global.window as any).webkitSpeechRecognition

      const { result } = renderHook(() => useSpeechRecognition())

      expect(result.current.isSupported).toBe(false)
      expect(result.current.error).toContain('not supported')
    })

    it('should apply custom options', () => {
      renderHook(() =>
        useSpeechRecognition({
          continuous: true,
          interimResults: true,
          lang: 'es-ES',
          maxAlternatives: 3,
        })
      )

      expect(mockRecognition.continuous).toBe(true)
      expect(mockRecognition.interimResults).toBe(true)
      expect(mockRecognition.lang).toBe('es-ES')
      expect(mockRecognition.maxAlternatives).toBe(3)
    })
  })

  describe('startListening', () => {
    it('should start listening when called', () => {
      const { result } = renderHook(() => useSpeechRecognition())
      const startSpy = jest.spyOn(mockRecognition, 'start')

      act(() => {
        result.current.startListening()
      })

      expect(startSpy).toHaveBeenCalled()
    })

    it('should update isListening state when started', async () => {
      const { result } = renderHook(() => useSpeechRecognition())

      act(() => {
        result.current.startListening()
      })

      // Trigger onstart event
      act(() => {
        mockRecognition.onstart?.(new Event('start'))
      })

      await waitFor(() => {
        expect(result.current.isListening).toBe(true)
      })
    })

    it('should not start if already listening', () => {
      const { result } = renderHook(() => useSpeechRecognition())
      const startSpy = jest.spyOn(mockRecognition, 'start')

      // Start first time
      act(() => {
        result.current.startListening()
      })
      
      act(() => {
        mockRecognition.onstart?.(new Event('start'))
      })

      startSpy.mockClear()

      // Try to start again
      act(() => {
        result.current.startListening()
      })

      expect(startSpy).not.toHaveBeenCalled()
    })
  })

  describe('stopListening', () => {
    it('should stop listening when called', async () => {
      const { result } = renderHook(() => useSpeechRecognition())
      const stopSpy = jest.spyOn(mockRecognition, 'stop')

      // Start listening first
      act(() => {
        result.current.startListening()
      })
      
      act(() => {
        mockRecognition.onstart?.(new Event('start'))
      })

      // Then stop
      act(() => {
        result.current.stopListening()
      })

      expect(stopSpy).toHaveBeenCalled()
    })

    it('should update isListening state when stopped', async () => {
      const { result } = renderHook(() => useSpeechRecognition())

      act(() => {
        result.current.startListening()
      })
      
      act(() => {
        mockRecognition.onstart?.(new Event('start'))
      })

      act(() => {
        result.current.stopListening()
      })
      
      act(() => {
        mockRecognition.onend?.(new Event('end'))
      })

      await waitFor(() => {
        expect(result.current.isListening).toBe(false)
      })
    })
  })

  describe('transcript handling', () => {
    it('should update transcript with final results', async () => {
      const { result } = renderHook(() => useSpeechRecognition())

      act(() => {
        result.current.startListening()
      })

      act(() => {
        mockRecognition.triggerResult('Hello world', true, 0.95)
      })

      await waitFor(() => {
        expect(result.current.transcript).toContain('Hello world')
      })
    })

    it('should update interim transcript with non-final results', async () => {
      const { result } = renderHook(() => useSpeechRecognition({ interimResults: true }))

      act(() => {
        result.current.startListening()
      })

      act(() => {
        mockRecognition.triggerResult('Hello', false, 0.8)
      })

      await waitFor(() => {
        expect(result.current.interimTranscript).toBe('Hello')
      })
    })

    it('should accumulate multiple final results', async () => {
      const { result } = renderHook(() => useSpeechRecognition())

      act(() => {
        result.current.startListening()
      })

      act(() => {
        mockRecognition.triggerResult('Hello', true)
      })

      await waitFor(() => {
        expect(result.current.transcript).toContain('Hello')
      })

      act(() => {
        mockRecognition.triggerResult('world', true)
      })

      await waitFor(() => {
        expect(result.current.transcript).toContain('Hello')
        expect(result.current.transcript).toContain('world')
      })
    })

    it('should call onResult callback with final results', async () => {
      const onResult = jest.fn()
      const { result } = renderHook(() => useSpeechRecognition({ onResult }))

      act(() => {
        result.current.startListening()
      })

      act(() => {
        mockRecognition.triggerResult('Test transcript', true, 0.92)
      })

      await waitFor(() => {
        expect(onResult).toHaveBeenCalledWith({
          transcript: 'Test transcript',
          confidence: 0.92,
          isFinal: true,
        })
      })
    })
  })

  describe('resetTranscript', () => {
    it('should clear all transcripts', async () => {
      const { result } = renderHook(() => useSpeechRecognition())

      act(() => {
        result.current.startListening()
      })

      act(() => {
        mockRecognition.triggerResult('Test', true)
      })

      await waitFor(() => {
        expect(result.current.transcript).toBe('Test ')
      })

      act(() => {
        result.current.resetTranscript()
      })

      expect(result.current.transcript).toBe('')
      expect(result.current.interimTranscript).toBe('')
    })
  })

  describe('error handling', () => {
    it('should handle no-speech error', async () => {
      const { result } = renderHook(() => useSpeechRecognition())

      act(() => {
        result.current.startListening()
      })

      act(() => {
        mockRecognition.triggerError('no-speech')
      })

      await waitFor(() => {
        expect(result.current.error).toContain('No speech was detected')
      })
    })

    it('should handle not-allowed error', async () => {
      const { result } = renderHook(() => useSpeechRecognition())

      act(() => {
        result.current.startListening()
      })

      act(() => {
        mockRecognition.triggerError('not-allowed')
      })

      await waitFor(() => {
        expect(result.current.error).toContain('permission was denied')
        expect(result.current.hasPermission).toBe(false)
      })
    })

    it('should handle audio-capture error', async () => {
      const { result } = renderHook(() => useSpeechRecognition())

      act(() => {
        result.current.startListening()
      })

      act(() => {
        mockRecognition.triggerError('audio-capture')
      })

      await waitFor(() => {
        expect(result.current.error).toContain('microphone')
      })
    })

    it('should call onError callback when error occurs', async () => {
      const onError = jest.fn()
      const { result } = renderHook(() => useSpeechRecognition({ onError }))

      act(() => {
        result.current.startListening()
      })

      act(() => {
        mockRecognition.triggerError('network')
      })

      await waitFor(() => {
        expect(onError).toHaveBeenCalled()
        expect(onError.mock.calls[0][0]).toContain('Network error')
      })
    })

    it('should stop listening when error occurs', async () => {
      const { result } = renderHook(() => useSpeechRecognition())

      act(() => {
        result.current.startListening()
      })
      
      act(() => {
        mockRecognition.onstart?.(new Event('start'))
      })

      act(() => {
        mockRecognition.triggerError('no-speech')
      })

      await waitFor(() => {
        expect(result.current.isListening).toBe(false)
      })
    })
  })

  describe('cleanup', () => {
    it('should abort recognition on unmount', () => {
      const { unmount } = renderHook(() => useSpeechRecognition())
      const abortSpy = jest.spyOn(mockRecognition, 'abort')

      unmount()

      expect(abortSpy).toHaveBeenCalled()
    })
  })
})

describe('isSpeechRecognitionSupported', () => {
  it('should return true when SpeechRecognition is available', () => {
    global.window.SpeechRecognition = jest.fn() as any
    
    const { isSpeechRecognitionSupported } = require('../use-speech-recognition')
    expect(isSpeechRecognitionSupported()).toBe(true)
  })

  it('should return true when webkitSpeechRecognition is available', () => {
    delete (global.window as any).SpeechRecognition
    global.window.webkitSpeechRecognition = jest.fn() as any
    
    const { isSpeechRecognitionSupported } = require('../use-speech-recognition')
    expect(isSpeechRecognitionSupported()).toBe(true)
  })

  it('should return false when neither is available', () => {
    delete (global.window as any).SpeechRecognition
    delete (global.window as any).webkitSpeechRecognition
    
    const { isSpeechRecognitionSupported } = require('../use-speech-recognition')
    expect(isSpeechRecognitionSupported()).toBe(false)
  })
})

describe('requestMicrophonePermission', () => {
  it('should request microphone permission', async () => {
    const mockStream = {
      getTracks: jest.fn().mockReturnValue([{ stop: jest.fn() }]),
    }
    
    global.navigator.mediaDevices = {
      getUserMedia: jest.fn().mockResolvedValue(mockStream),
    } as any

    const { requestMicrophonePermission } = require('../use-speech-recognition')
    const result = await requestMicrophonePermission()

    expect(result).toBe(true)
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true })
    expect(mockStream.getTracks()[0].stop).toHaveBeenCalled()
  })

  it('should return false when permission is denied', async () => {
    global.navigator.mediaDevices = {
      getUserMedia: jest.fn().mockRejectedValue(new Error('Permission denied')),
    } as any

    const { requestMicrophonePermission } = require('../use-speech-recognition')
    const result = await requestMicrophonePermission()

    expect(result).toBe(false)
  })
})

