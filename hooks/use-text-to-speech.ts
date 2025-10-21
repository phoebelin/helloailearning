/**
 * Custom hook for Text-to-Speech functionality
 * Provides speech synthesis with voice selection, queue management, and playback controls
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface TextToSpeechOptions {
  lang?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice | null;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

interface SpeechQueueItem {
  id: string;
  text: string;
  options?: Partial<TextToSpeechOptions>;
}

interface UseTextToSpeechReturn {
  speak: (text: string, options?: Partial<TextToSpeechOptions>) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  cancel: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setVoice: (voice: SpeechSynthesisVoice | null) => void;
  queueLength: number;
}

/**
 * Custom hook for text-to-speech using Web Speech API
 * Provides queue management and child-friendly voice selection
 * 
 * @param options - Default configuration options for speech synthesis
 * @returns Text-to-speech state and control functions
 * 
 * @example
 * ```tsx
 * const { speak, stop, isSpeaking, voices } = useTextToSpeech({
 *   lang: 'en-US',
 *   rate: 0.9,
 *   pitch: 1.2
 * });
 * 
 * speak("Hello! I'm Zhorai!");
 * ```
 */
export function useTextToSpeech(
  defaultOptions: TextToSpeechOptions = {}
): UseTextToSpeechReturn {
  const {
    lang = 'en-US',
    pitch = 1.0,
    rate = 1.0,
    volume = 1.0,
    voice = null,
    onStart,
    onEnd,
    onError,
  } = defaultOptions;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(() => {
    // Initialize with actual browser support check
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  });
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(voice);
  const [queueLength, setQueueLength] = useState(0);

  const queueRef = useRef<SpeechQueueItem[]>([]);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isProcessingRef = useRef(false);
  const voiceInitializedRef = useRef(false);

  // Check browser compatibility and load voices
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setIsSupported(true);

      // Load available voices
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);

        // Auto-select a child-friendly voice ONLY ONCE if none selected
        if (!voiceInitializedRef.current && !selectedVoice && availableVoices.length > 0) {
          const childFriendlyVoice = findChildFriendlyVoice(availableVoices, lang);
          setSelectedVoice(childFriendlyVoice);
          voiceInitializedRef.current = true;
        }
      };

      // Voices might load asynchronously
      loadVoices();
      
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }

      // Cleanup
      return () => {
        window.speechSynthesis.cancel();
      };
    } else {
      setIsSupported(false);
    }
  }, [lang]);

  // Process speech queue
  const processQueue = useCallback(() => {
    if (isProcessingRef.current || queueRef.current.length === 0) {
      return;
    }

    isProcessingRef.current = true;
    const item = queueRef.current.shift();
    setQueueLength(queueRef.current.length);

    if (!item) {
      isProcessingRef.current = false;
      return;
    }

    const utterance = new SpeechSynthesisUtterance(item.text);
    
    // Apply options
    const itemOptions = { ...defaultOptions, ...item.options };
    utterance.lang = itemOptions.lang || lang;
    utterance.pitch = itemOptions.pitch ?? pitch;
    utterance.rate = itemOptions.rate ?? rate;
    utterance.volume = itemOptions.volume ?? volume;
    
    if (itemOptions.voice || selectedVoice) {
      utterance.voice = itemOptions.voice || selectedVoice;
    }

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      if (onStart || itemOptions.onStart) {
        (itemOptions.onStart || onStart)?.();
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      currentUtteranceRef.current = null;
      isProcessingRef.current = false;
      
      if (onEnd || itemOptions.onEnd) {
        (itemOptions.onEnd || onEnd)?.();
      }

      // Process next item in queue
      processQueue();
    };

    utterance.onerror = (event) => {
      const errorMessage = `Speech synthesis error: ${event.error}`;
      
      // Only log non-canceled errors to avoid console spam
      if (event.error !== 'canceled') {
        console.error(errorMessage, event);
      }
      
      setIsSpeaking(false);
      setIsPaused(false);
      currentUtteranceRef.current = null;
      isProcessingRef.current = false;

      if (onError || itemOptions.onError) {
        (itemOptions.onError || onError)?.(errorMessage);
      }

      // Continue with next item despite error
      processQueue();
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    currentUtteranceRef.current = utterance;
    
    try {
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error speaking:', error);
      isProcessingRef.current = false;
      setIsSpeaking(false);
      
      if (onError) {
        onError(error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }, [defaultOptions, lang, pitch, rate, volume, selectedVoice, onStart, onEnd, onError]);

  // Speak function - adds text to queue
  const speak = useCallback((text: string, options?: Partial<TextToSpeechOptions>) => {
    if (!isSupported) {
      console.warn('Text-to-speech is not supported in this browser.');
      return;
    }

    if (!text.trim()) {
      console.warn('Cannot speak empty text.');
      return;
    }

    const queueItem: SpeechQueueItem = {
      id: `speech-${Date.now()}-${Math.random()}`,
      text,
      options,
    };

    queueRef.current.push(queueItem);
    setQueueLength(queueRef.current.length);

    // Start processing if not already processing
    if (!isProcessingRef.current) {
      processQueue();
    }
  }, [isSupported, processQueue]);

  // Pause speaking
  const pause = useCallback(() => {
    if (!isSupported || !isSpeaking || isPaused) {
      return;
    }

    try {
      window.speechSynthesis.pause();
      setIsPaused(true);
    } catch (error) {
      console.error('Error pausing speech:', error);
    }
  }, [isSupported, isSpeaking, isPaused]);

  // Resume speaking
  const resume = useCallback(() => {
    if (!isSupported || !isPaused) {
      return;
    }

    try {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } catch (error) {
      console.error('Error resuming speech:', error);
    }
  }, [isSupported, isPaused]);

  // Stop current speech and clear queue
  const stop = useCallback(() => {
    if (!isSupported) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      queueRef.current = [];
      setQueueLength(0);
      setIsSpeaking(false);
      setIsPaused(false);
      currentUtteranceRef.current = null;
      isProcessingRef.current = false;
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  }, [isSupported]);

  // Cancel current speech but continue with queue
  const cancel = useCallback(() => {
    if (!isSupported) {
      return;
    }

    try {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      currentUtteranceRef.current = null;
      isProcessingRef.current = false;
      
      // Continue with next item in queue
      processQueue();
    } catch (error) {
      console.error('Error canceling speech:', error);
    }
  }, [isSupported, processQueue]);

  // Set voice preference
  const setVoice = useCallback((voice: SpeechSynthesisVoice | null) => {
    setSelectedVoice(voice);
  }, []);

  return {
    speak,
    pause,
    resume,
    stop,
    cancel,
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    selectedVoice,
    setVoice,
    queueLength,
  };
}

/**
 * Find a child-friendly voice from available voices
 * Prioritizes voices with higher pitch and female voices
 * 
 * @param voices - Available speech synthesis voices
 * @param preferredLang - Preferred language code
 * @returns A child-friendly voice or the first available voice
 */
function findChildFriendlyVoice(
  voices: SpeechSynthesisVoice[],
  preferredLang: string = 'en-US'
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;

  // Filter by language first
  const langVoices = voices.filter(v => v.lang.startsWith(preferredLang.split('-')[0]));
  const voicesToSearch = langVoices.length > 0 ? langVoices : voices;

  // Look for child-friendly keywords in voice names
  const childKeywords = ['child', 'kid', 'junior'];
  const childVoice = voicesToSearch.find(v => 
    childKeywords.some(keyword => v.name.toLowerCase().includes(keyword))
  );
  
  if (childVoice) return childVoice;

  // Look for female voices (typically higher pitch, more child-friendly)
  const femaleKeywords = ['female', 'woman', 'girl', 'samantha', 'victoria', 'karen', 'zira'];
  const femaleVoice = voicesToSearch.find(v =>
    femaleKeywords.some(keyword => v.name.toLowerCase().includes(keyword))
  );

  if (femaleVoice) return femaleVoice;

  // Look for voices with positive, friendly names
  const friendlyKeywords = ['google us english', 'english united states', 'samantha', 'nicky', 'tessa'];
  const friendlyVoice = voicesToSearch.find(v =>
    friendlyKeywords.some(keyword => v.name.toLowerCase().includes(keyword))
  );

  if (friendlyVoice) return friendlyVoice;

  // Default to first voice in preferred language, or first voice overall
  return voicesToSearch[0] || voices[0];
}

/**
 * Utility function to check if text-to-speech is supported
 * Can be used outside of React components
 */
export function isTextToSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Utility function to get all available voices
 * Returns a promise that resolves when voices are loaded
 */
export function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!isTextToSpeechSupported()) {
      resolve([]);
      return;
    }

    let voices = window.speechSynthesis.getVoices();
    
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // Voices might load asynchronously
    const onVoicesChanged = () => {
      voices = window.speechSynthesis.getVoices();
      resolve(voices);
      window.speechSynthesis.onvoiceschanged = null;
    };

    window.speechSynthesis.onvoiceschanged = onVoicesChanged;
    
    // Fallback timeout
    setTimeout(() => {
      window.speechSynthesis.onvoiceschanged = null;
      resolve(window.speechSynthesis.getVoices());
    }, 1000);
  });
}

