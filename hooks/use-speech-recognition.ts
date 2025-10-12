/**
 * Custom hook for Web Speech API integration
 * Provides speech-to-text functionality with error handling and browser compatibility
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { SpeechRecognitionResult } from '@/types/activity';

// Extend Window interface for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

interface UseSpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
  maxAlternatives?: number;
  onResult?: (result: SpeechRecognitionResult) => void;
  onError?: (error: string) => void;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  hasPermission: boolean | null;
}

/**
 * Custom hook for speech recognition using Web Speech API
 * 
 * @param options - Configuration options for speech recognition
 * @returns Speech recognition state and control functions
 * 
 * @example
 * ```tsx
 * const { isListening, transcript, startListening, stopListening } = useSpeechRecognition({
 *   continuous: true,
 *   interimResults: true,
 *   lang: 'en-US'
 * });
 * ```
 */
export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const {
    continuous = false,
    interimResults = true,
    lang = 'en-US',
    maxAlternatives = 1,
    onResult,
    onError,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef('');
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);

  // Keep callback refs updated
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Check browser compatibility on mount
  useEffect(() => {
    const SpeechRecognitionAPI = 
      window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
    }
  }, []);

  // Initialize speech recognition instance
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionAPI = 
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = lang;
    recognition.maxAlternatives = maxAlternatives;

    // Handle recognition results
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptText = result[0].transcript;

        if (result.isFinal) {
          final += transcriptText + ' ';
          
          // Call onResult callback with final result
          if (onResultRef.current) {
            onResultRef.current({
              transcript: transcriptText,
              confidence: result[0].confidence || 0,
              isFinal: true,
            });
          }
        } else {
          interim += transcriptText;
        }
      }

      if (final) {
        finalTranscriptRef.current += final;
        setTranscript(finalTranscriptRef.current);
      }

      setInterimTranscript(interim);
    };

    // Handle recognition start
    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setHasPermission(true);
    };

    // Handle recognition end
    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    // Handle errors
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = 'An error occurred during speech recognition.';

      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech was detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone was found. Please ensure a microphone is connected.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission was denied. Please allow microphone access in your browser settings.';
          setHasPermission(false);
          break;
        case 'network':
          errorMessage = 'Network error occurred. Please check your internet connection.';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition was aborted.';
          break;
        case 'bad-grammar':
          errorMessage = 'Speech recognition grammar error.';
          break;
        case 'language-not-supported':
          errorMessage = `Language '${lang}' is not supported.`;
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }

      setError(errorMessage);
      setIsListening(false);

      if (onErrorRef.current) {
        onErrorRef.current(errorMessage);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, [isSupported, continuous, interimResults, lang, maxAlternatives]);

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      return;
    }

    if (!recognitionRef.current) {
      setError('Speech recognition is not initialized yet. Please try again.');
      return;
    }

    setError(null);
    
    try {
      recognitionRef.current.start();
    } catch (err) {
      // If already started, ignore the error
      const errorMessage = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
      if (!errorMessage.includes('already started')) {
        const friendlyError = 'Failed to start speech recognition. Please try again.';
        setError(friendlyError);
        console.error('Speech recognition error:', err);
      }
    }
  }, [isSupported, isListening]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!isListening) {
      return;
    }

    try {
      recognitionRef.current?.stop();
    } catch (err) {
      console.error('Error stopping speech recognition:', err);
    }
  }, [isListening]);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    finalTranscriptRef.current = '';
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    hasPermission,
  };
}

/**
 * Utility function to check if speech recognition is supported
 * Can be used outside of React components
 */
export function isSpeechRecognitionSupported(): boolean {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Utility function to request microphone permission
 * Returns a promise that resolves with permission status
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop all tracks immediately as we just needed to check permission
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('Microphone permission denied:', error);
    return false;
  }
}

