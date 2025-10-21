/**
 * Enhanced Text-to-Speech Hook with Google Cloud TTS + Web Speech API fallback
 * Provides reliable TTS across all browsers
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
  useGoogleCloud?: boolean; // Force Google Cloud TTS
}

interface SpeechQueueItem {
  id: string;
  text: string;
  options?: Partial<TextToSpeechOptions>;
}

interface UseEnhancedTextToSpeechReturn {
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
  isGoogleCloudAvailable: boolean;
  isGoogleCloudChecked: boolean;
}

/**
 * Enhanced text-to-speech hook with Google Cloud TTS + Web Speech API fallback
 */
export function useEnhancedTextToSpeech(
  defaultOptions: TextToSpeechOptions = {}
): UseEnhancedTextToSpeechReturn {
  const {
    lang = 'en-US',
    pitch = 1.0,
    rate = 1.0,
    volume = 1.0,
    voice = null,
    onStart,
    onEnd,
    onError,
    useGoogleCloud = false,
  } = defaultOptions;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(() => {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  });
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(voice);
  const [queueLength, setQueueLength] = useState(0);
  const [isGoogleCloudAvailable, setIsGoogleCloudAvailable] = useState(false);
  const [isGoogleCloudChecked, setIsGoogleCloudChecked] = useState(false);
  const [googleCloudPort, setGoogleCloudPort] = useState<number | null>(null);

  const queueRef = useRef<SpeechQueueItem[]>([]);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isProcessingRef = useRef(false);
  const voiceInitializedRef = useRef(false);

  // Check Google Cloud TTS availability
  useEffect(() => {
    const checkGoogleCloudTTS = async () => {
      try {
        // Try both ports since Next.js might be running on different ports
        const ports = [3000, 3001];
        let response = null;
        
        for (const port of ports) {
          try {
            response = await fetch(`http://localhost:${port}/api/tts`, { method: 'GET' });
            if (response.ok) {
              console.log(`Google Cloud TTS available on port ${port}`);
              setIsGoogleCloudAvailable(true);
              setIsGoogleCloudChecked(true);
              setGoogleCloudPort(port);
              return;
            }
          } catch (portError) {
            console.log(`Port ${port} not available:`, portError);
          }
        }
        
        console.log('Google Cloud TTS not available on any port');
        setIsGoogleCloudAvailable(false);
        setIsGoogleCloudChecked(true);
      } catch (error) {
        console.log('Google Cloud TTS not available:', error);
        setIsGoogleCloudAvailable(false);
        setIsGoogleCloudChecked(true);
      }
    };

    checkGoogleCloudTTS();
  }, []);

  // Load Web Speech API voices
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setIsSupported(true);

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);

        if (!voiceInitializedRef.current && !selectedVoice && availableVoices.length > 0) {
          const childFriendlyVoice = findChildFriendlyVoice(availableVoices, lang);
          setSelectedVoice(childFriendlyVoice);
          voiceInitializedRef.current = true;
        }
      };

      loadVoices();
      
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }

      return () => {
        window.speechSynthesis.cancel();
      };
    } else {
      setIsSupported(false);
    }
  }, [lang]);

  // Google Cloud TTS function
  const speakWithGoogleCloud = useCallback(async (text: string, options: Partial<TextToSpeechOptions>) => {
    try {
      console.log('Enhanced TTS: Using Google Cloud TTS for:', text.substring(0, 50) + '...');
      
      const port = googleCloudPort || 3000;
      const response = await fetch(`http://localhost:${port}/api/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          options: {
            voice: {
              languageCode: options.lang || lang,
              ssmlGender: 'FEMALE',
            },
            audioConfig: {
              speakingRate: options.rate ?? rate,
              pitch: options.pitch ?? pitch,
              volumeGainDb: options.volume ? (options.volume - 1) * 10 : 0,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success || !result.audioData) {
        throw new Error(result.error || 'No audio data received');
      }

      // Create audio element and play
      const audio = new Audio(`data:${result.mimeType};base64,${result.audioData}`);
      currentAudioRef.current = audio;

      audio.onloadstart = () => {
        console.log('Enhanced TTS: Google Cloud audio started');
        setIsSpeaking(true);
        setIsPaused(false);
        if (options.onStart || onStart) {
          (options.onStart || onStart)?.();
        }
      };

      audio.onended = () => {
        console.log('Enhanced TTS: Google Cloud audio ended');
        setIsSpeaking(false);
        setIsPaused(false);
        currentAudioRef.current = null;
        isProcessingRef.current = false;
        
        if (options.onEnd || onEnd) {
          (options.onEnd || onEnd)?.();
        }

        // Process next item in queue
        processQueue();
      };

      audio.onerror = (event) => {
        console.error('Enhanced TTS: Google Cloud audio error:', event);
        setIsSpeaking(false);
        setIsPaused(false);
        currentAudioRef.current = null;
        isProcessingRef.current = false;

        const errorMessage = 'Google Cloud TTS audio playback failed';
        if (options.onError || onError) {
          (options.onError || onError)?.(errorMessage);
        }

        // Try Web Speech API as fallback
        console.log('Enhanced TTS: Falling back to Web Speech API');
        speakWithWebSpeechAPI(text, options);
      };

      await audio.play();
    } catch (error) {
      console.error('Enhanced TTS: Google Cloud TTS failed:', error);
      
      // Fallback to Web Speech API
      console.log('Enhanced TTS: Falling back to Web Speech API');
      speakWithWebSpeechAPI(text, options);
    }
  }, [lang, pitch, rate, volume, onStart, onEnd, onError]);

  // Web Speech API function
  const speakWithWebSpeechAPI = useCallback((text: string, options: Partial<TextToSpeechOptions>) => {
    if (!isSupported) {
      console.warn('Enhanced TTS: Web Speech API not supported');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.lang = options.lang || lang;
    utterance.pitch = options.pitch ?? pitch;
    utterance.rate = options.rate ?? rate;
    utterance.volume = options.volume ?? volume;
    
    if (options.voice || selectedVoice) {
      utterance.voice = options.voice || selectedVoice;
    }

    utterance.onstart = () => {
      console.log('Enhanced TTS: Web Speech API started');
      setIsSpeaking(true);
      setIsPaused(false);
      if (options.onStart || onStart) {
        (options.onStart || onStart)?.();
      }
    };

    utterance.onend = () => {
      console.log('Enhanced TTS: Web Speech API ended');
      setIsSpeaking(false);
      setIsPaused(false);
      currentUtteranceRef.current = null;
      isProcessingRef.current = false;
      
      if (options.onEnd || onEnd) {
        (options.onEnd || onEnd)?.();
      }

      processQueue();
    };

    utterance.onerror = (event) => {
      console.error('Enhanced TTS: Web Speech API error:', event);
      setIsSpeaking(false);
      setIsPaused(false);
      currentUtteranceRef.current = null;
      isProcessingRef.current = false;

      const errorMessage = `Web Speech API error: ${event.error}`;
      if (options.onError || onError) {
        (options.onError || onError)?.(errorMessage);
      }

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
      console.error('Enhanced TTS: Error speaking with Web Speech API:', error);
      isProcessingRef.current = false;
      setIsSpeaking(false);
      
      if (options.onError || onError) {
        (options.onError || onError)?.(error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }, [isSupported, lang, pitch, rate, volume, selectedVoice, onStart, onEnd, onError, googleCloudPort]);

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

    const itemOptions = { ...defaultOptions, ...item.options };
    
    // Choose TTS method
    if ((useGoogleCloud || itemOptions.useGoogleCloud) && isGoogleCloudAvailable) {
      speakWithGoogleCloud(item.text, itemOptions);
    } else {
      speakWithWebSpeechAPI(item.text, itemOptions);
    }
  }, [defaultOptions, useGoogleCloud, isGoogleCloudAvailable, speakWithGoogleCloud, speakWithWebSpeechAPI]);

  // Main speak function
  const speak = useCallback((text: string, options?: Partial<TextToSpeechOptions>) => {
    if (!text.trim()) {
      console.warn('Enhanced TTS: Cannot speak empty text');
      return;
    }

    const queueItem: SpeechQueueItem = {
      id: `speech-${Date.now()}-${Math.random()}`,
      text,
      options,
    };

    queueRef.current.push(queueItem);
    setQueueLength(queueRef.current.length);

    if (!isProcessingRef.current) {
      processQueue();
    }
  }, [processQueue]);

  // Control functions
  const pause = useCallback(() => {
    if (isSpeaking && !isPaused) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        setIsPaused(true);
      } else if (currentUtteranceRef.current) {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    }
  }, [isSpeaking, isPaused]);

  const resume = useCallback(() => {
    if (isPaused) {
      if (currentAudioRef.current) {
        currentAudioRef.current.play();
        setIsPaused(false);
      } else if (currentUtteranceRef.current) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      }
    }
  }, [isPaused]);

  const stop = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    
    if (currentUtteranceRef.current) {
      window.speechSynthesis.cancel();
      currentUtteranceRef.current = null;
    }
    
    queueRef.current = [];
    setQueueLength(0);
    setIsSpeaking(false);
    setIsPaused(false);
    isProcessingRef.current = false;
  }, []);

  const cancel = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    
    if (currentUtteranceRef.current) {
      window.speechSynthesis.cancel();
      currentUtteranceRef.current = null;
    }
    
    setIsSpeaking(false);
    setIsPaused(false);
    isProcessingRef.current = false;
    
    processQueue();
  }, [processQueue]);

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
    isGoogleCloudAvailable,
    isGoogleCloudChecked,
  };
}

/**
 * Find a child-friendly voice from available voices
 */
function findChildFriendlyVoice(
  voices: SpeechSynthesisVoice[],
  preferredLang: string = 'en-US'
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;

  const langVoices = voices.filter(v => v.lang.startsWith(preferredLang.split('-')[0]));
  const voicesToSearch = langVoices.length > 0 ? langVoices : voices;

  const childKeywords = ['child', 'kid', 'junior'];
  const childVoice = voicesToSearch.find(v => 
    childKeywords.some(keyword => v.name.toLowerCase().includes(keyword))
  );
  
  if (childVoice) return childVoice;

  const femaleKeywords = ['female', 'woman', 'girl', 'samantha', 'victoria', 'karen', 'zira'];
  const femaleVoice = voicesToSearch.find(v =>
    femaleKeywords.some(keyword => v.name.toLowerCase().includes(keyword))
  );

  if (femaleVoice) return femaleVoice;

  const friendlyKeywords = ['google us english', 'english united states', 'samantha', 'nicky', 'tessa'];
  const friendlyVoice = voicesToSearch.find(v =>
    friendlyKeywords.some(keyword => v.name.toLowerCase().includes(keyword))
  );

  if (friendlyVoice) return friendlyVoice;

  return voicesToSearch[0] || voices[0];
}
