/**
 * Tests for useTextToSpeech hook
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useTextToSpeech } from '../use-text-to-speech'

// Mock SpeechSynthesis API
class MockSpeechSynthesisUtterance {
  text = ''
  lang = 'en-US'
  pitch = 1.0
  rate = 1.0
  volume = 1.0
  voice: any = null
  onstart: ((event: Event) => void) | null = null
  onend: ((event: Event) => void) | null = null
  onerror: ((event: any) => void) | null = null
  onpause: ((event: Event) => void) | null = null
  onresume: ((event: Event) => void) | null = null

  constructor(text: string) {
    this.text = text
  }
}

class MockSpeechSynthesis {
  speaking = false
  paused = false
  pending = false
  onvoiceschanged: ((event: Event) => void) | null = null
  
  private utterances: MockSpeechSynthesisUtterance[] = []
  private mockVoices: SpeechSynthesisVoice[] = []

  speak(utterance: MockSpeechSynthesisUtterance) {
    this.utterances.push(utterance)
    this.speaking = true
    
    // Simulate async speech
    setTimeout(() => {
      if (utterance.onstart) {
        utterance.onstart(new Event('start'))
      }
      
      setTimeout(() => {
        if (utterance.onend) {
          utterance.onend(new Event('end'))
        }
        this.speaking = false
      }, 10)
    }, 10)
  }

  cancel() {
    this.utterances = []
    this.speaking = false
    this.paused = false
  }

  pause() {
    this.paused = true
    const lastUtterance = this.utterances[this.utterances.length - 1]
    if (lastUtterance?.onpause) {
      lastUtterance.onpause(new Event('pause'))
    }
  }

  resume() {
    this.paused = false
    const lastUtterance = this.utterances[this.utterances.length - 1]
    if (lastUtterance?.onresume) {
      lastUtterance.onresume(new Event('resume'))
    }
  }

  getVoices() {
    return this.mockVoices
  }

  setMockVoices(voices: any[]) {
    this.mockVoices = voices as SpeechSynthesisVoice[]
  }
}

describe('useTextToSpeech', () => {
  let mockSynthesis: MockSpeechSynthesis

  beforeEach(() => {
    mockSynthesis = new MockSpeechSynthesis()
    global.window.speechSynthesis = mockSynthesis as any
    global.window.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance as any

    // Mock voices
    const mockVoices = [
      { name: 'Google US English', lang: 'en-US', voiceURI: 'Google US English' },
      { name: 'Samantha', lang: 'en-US', voiceURI: 'Samantha' },
      { name: 'Spanish Voice', lang: 'es-ES', voiceURI: 'Spanish' },
    ] as SpeechSynthesisVoice[]

    mockSynthesis.setMockVoices(mockVoices)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useTextToSpeech())

      expect(result.current.isSpeaking).toBe(false)
      expect(result.current.isPaused).toBe(false)
      expect(result.current.isSupported).toBe(true)
      expect(result.current.voices).toBeDefined()
      expect(result.current.queueLength).toBe(0)
    })

    it('should detect when speech synthesis is not supported', () => {
      delete (global.window as any).speechSynthesis

      const { result } = renderHook(() => useTextToSpeech())

      expect(result.current.isSupported).toBe(false)
    })

    it('should load available voices', async () => {
      const { result } = renderHook(() => useTextToSpeech())

      await waitFor(() => {
        expect(result.current.voices.length).toBeGreaterThan(0)
      })
    })

    it('should auto-select a child-friendly voice', async () => {
      const { result } = renderHook(() => useTextToSpeech({ lang: 'en-US' }))

      await waitFor(() => {
        expect(result.current.selectedVoice).toBeTruthy()
      })
    })
  })

  describe('speak function', () => {
    it('should speak text when called', async () => {
      const { result } = renderHook(() => useTextToSpeech())
      const speakSpy = jest.spyOn(mockSynthesis, 'speak')

      act(() => {
        result.current.speak('Hello world')
      })

      await waitFor(() => {
        expect(speakSpy).toHaveBeenCalled()
      })
    })

    it('should update isSpeaking state', async () => {
      const { result } = renderHook(() => useTextToSpeech())

      act(() => {
        result.current.speak('Hello world')
      })

      await waitFor(() => {
        expect(result.current.isSpeaking).toBe(true)
      })

      await waitFor(() => {
        expect(result.current.isSpeaking).toBe(false)
      }, { timeout: 500 })
    })

    it('should not speak empty text', () => {
      const { result } = renderHook(() => useTextToSpeech())
      const speakSpy = jest.spyOn(mockSynthesis, 'speak')

      act(() => {
        result.current.speak('')
      })

      expect(speakSpy).not.toHaveBeenCalled()
    })

    it('should not speak if not supported', () => {
      delete (global.window as any).speechSynthesis
      
      const { result } = renderHook(() => useTextToSpeech())

      act(() => {
        result.current.speak('Hello')
      })

      // Should not throw and should not call speak
      expect(result.current.isSpeaking).toBe(false)
    })

    it('should call onStart callback when speaking starts', async () => {
      const onStart = jest.fn()
      const { result } = renderHook(() => useTextToSpeech({ onStart }))

      act(() => {
        result.current.speak('Hello')
      })

      await waitFor(() => {
        expect(onStart).toHaveBeenCalled()
      })
    })

    it('should call onEnd callback when speaking ends', async () => {
      const onEnd = jest.fn()
      const { result } = renderHook(() => useTextToSpeech({ onEnd }))

      act(() => {
        result.current.speak('Hello')
      })

      await waitFor(() => {
        expect(onEnd).toHaveBeenCalled()
      }, { timeout: 500 })
    })
  })

  describe('pause and resume', () => {
    it('should pause speaking', async () => {
      const { result } = renderHook(() => useTextToSpeech())
      const pauseSpy = jest.spyOn(mockSynthesis, 'pause')

      act(() => {
        result.current.speak('Hello world')
      })

      await waitFor(() => {
        expect(result.current.isSpeaking).toBe(true)
      })

      act(() => {
        result.current.pause()
      })

      expect(pauseSpy).toHaveBeenCalled()
      await waitFor(() => {
        expect(result.current.isPaused).toBe(true)
      })
    })

    it('should resume speaking', async () => {
      const { result } = renderHook(() => useTextToSpeech())
      const resumeSpy = jest.spyOn(mockSynthesis, 'resume')

      act(() => {
        result.current.speak('Hello world')
      })

      await waitFor(() => {
        expect(result.current.isSpeaking).toBe(true)
      })

      act(() => {
        result.current.pause()
      })

      await waitFor(() => {
        expect(result.current.isPaused).toBe(true)
      })

      act(() => {
        result.current.resume()
      })

      expect(resumeSpy).toHaveBeenCalled()
      await waitFor(() => {
        expect(result.current.isPaused).toBe(false)
      })
    })

    it('should not pause if not speaking', () => {
      const { result } = renderHook(() => useTextToSpeech())
      const pauseSpy = jest.spyOn(mockSynthesis, 'pause')

      act(() => {
        result.current.pause()
      })

      expect(pauseSpy).not.toHaveBeenCalled()
    })

    it('should not resume if not paused', () => {
      const { result } = renderHook(() => useTextToSpeech())
      const resumeSpy = jest.spyOn(mockSynthesis, 'resume')

      act(() => {
        result.current.resume()
      })

      expect(resumeSpy).not.toHaveBeenCalled()
    })
  })

  describe('stop and cancel', () => {
    it('should stop all speech and clear queue', async () => {
      const { result } = renderHook(() => useTextToSpeech())
      const cancelSpy = jest.spyOn(mockSynthesis, 'cancel')

      act(() => {
        result.current.speak('Hello')
        result.current.speak('World')
      })

      expect(result.current.queueLength).toBeGreaterThan(0)

      act(() => {
        result.current.stop()
      })

      expect(cancelSpy).toHaveBeenCalled()
      expect(result.current.queueLength).toBe(0)
      expect(result.current.isSpeaking).toBe(false)
    })

    it('should cancel current but continue queue', async () => {
      const { result } = renderHook(() => useTextToSpeech())
      const cancelSpy = jest.spyOn(mockSynthesis, 'cancel')

      act(() => {
        result.current.speak('First')
        result.current.speak('Second')
      })

      act(() => {
        result.current.cancel()
      })

      expect(cancelSpy).toHaveBeenCalled()
    })
  })

  describe('voice selection', () => {
    it('should allow setting custom voice', async () => {
      const { result } = renderHook(() => useTextToSpeech())

      await waitFor(() => {
        expect(result.current.voices.length).toBeGreaterThan(0)
      })

      const targetVoice = result.current.voices[0]

      act(() => {
        result.current.setVoice(targetVoice)
      })

      expect(result.current.selectedVoice).toBe(targetVoice)
    })

    it('should use selected voice when speaking', async () => {
      const { result } = renderHook(() => useTextToSpeech())

      await waitFor(() => {
        expect(result.current.voices.length).toBeGreaterThan(0)
      })

      const targetVoice = result.current.voices[1]

      act(() => {
        result.current.setVoice(targetVoice)
      })

      act(() => {
        result.current.speak('Hello')
      })

      await waitFor(() => {
        expect(mockSynthesis.speaking).toBe(true)
      })
    })
  })

  describe('queue management', () => {
    it('should queue multiple speak requests', () => {
      const { result } = renderHook(() => useTextToSpeech())

      act(() => {
        result.current.speak('First')
        result.current.speak('Second')
        result.current.speak('Third')
      })

      expect(result.current.queueLength).toBeGreaterThanOrEqual(1)
    })

    it('should process queue sequentially', async () => {
      const { result } = renderHook(() => useTextToSpeech())
      const texts: string[] = []

      act(() => {
        result.current.speak('First')
        result.current.speak('Second')
      })

      await waitFor(() => {
        expect(result.current.queueLength).toBe(0)
      }, { timeout: 1000 })
    })
  })

  describe('custom options', () => {
    it('should apply custom pitch, rate, and volume', async () => {
      const { result } = renderHook(() =>
        useTextToSpeech({
          pitch: 1.5,
          rate: 0.8,
          volume: 0.7,
        })
      )

      act(() => {
        result.current.speak('Test')
      })

      await waitFor(() => {
        expect(mockSynthesis.speaking).toBe(true)
      })
    })

    it('should override default options per speak call', async () => {
      const { result } = renderHook(() => useTextToSpeech({ rate: 1.0 }))

      act(() => {
        result.current.speak('Test', { rate: 1.5 })
      })

      await waitFor(() => {
        expect(mockSynthesis.speaking).toBe(true)
      })
    })
  })

  describe('cleanup', () => {
    it('should cancel speech on unmount', () => {
      const { unmount } = renderHook(() => useTextToSpeech())
      const cancelSpy = jest.spyOn(mockSynthesis, 'cancel')

      unmount()

      expect(cancelSpy).toHaveBeenCalled()
    })
  })
})

describe('isTextToSpeechSupported', () => {
  it('should return true when speechSynthesis is available', () => {
    global.window.speechSynthesis = {} as any
    
    const { isTextToSpeechSupported } = require('../use-text-to-speech')
    expect(isTextToSpeechSupported()).toBe(true)
  })

  it('should return false when speechSynthesis is not available', () => {
    delete (global.window as any).speechSynthesis
    
    const { isTextToSpeechSupported } = require('../use-text-to-speech')
    expect(isTextToSpeechSupported()).toBe(false)
  })
})

describe('getAvailableVoices', () => {
  it('should return voices when available immediately', async () => {
    const mockVoices = [
      { name: 'Voice 1', lang: 'en-US' },
      { name: 'Voice 2', lang: 'es-ES' },
    ] as SpeechSynthesisVoice[]

    global.window.speechSynthesis = {
      getVoices: jest.fn().mockReturnValue(mockVoices),
      onvoiceschanged: null,
    } as any

    const { getAvailableVoices } = require('../use-text-to-speech')
    const voices = await getAvailableVoices()

    expect(voices).toEqual(mockVoices)
  })

  it('should wait for voices to load asynchronously', async () => {
    const mockVoices = [
      { name: 'Voice 1', lang: 'en-US' },
    ] as SpeechSynthesisVoice[]

    let voicesChangeHandler: (() => void) | null = null

    global.window.speechSynthesis = {
      getVoices: jest.fn()
        .mockReturnValueOnce([])
        .mockReturnValue(mockVoices),
      get onvoiceschanged() {
        return voicesChangeHandler
      },
      set onvoiceschanged(handler: (() => void) | null) {
        voicesChangeHandler = handler
        // Simulate async voices loading
        if (handler) {
          setTimeout(() => handler(), 10)
        }
      },
    } as any

    const { getAvailableVoices } = require('../use-text-to-speech')
    const voicesPromise = getAvailableVoices()

    const voices = await voicesPromise

    expect(voices).toEqual(mockVoices)
  })

  it('should return empty array when not supported', async () => {
    delete (global.window as any).speechSynthesis

    const { getAvailableVoices } = require('../use-text-to-speech')
    const voices = await getAvailableVoices()

    expect(voices).toEqual([])
  })
})

