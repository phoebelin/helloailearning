/**
 * Request validation utilities for TTS API security
 */

/**
 * Voice and language allowlist based on actual app usage
 * 
 * These values are extracted from all TTS call sites in the app:
 * - components/activity/*-step.tsx (Zhorai lesson)
 * - components/activities/coda/meet-coda-step.tsx (Coda lesson)
 * - hooks/use-enhanced-text-to-speech.ts (defaults)
 * - lib/services/google-cloud-tts.ts (backend defaults)
 * 
 * Current usage patterns:
 * - Language: en-US only
 * - Gender: FEMALE only
 * - Speaking rate: 0.88-0.9 (with backend default 0.9)
 * - Pitch: 1.1-1.15 (with backend default 1.1)
 * - Audio encoding: MP3 only
 */

export const ALLOWED_LANGUAGES = ['en-US'] as const;

export const ALLOWED_GENDERS = ['FEMALE', 'MALE', 'NEUTRAL'] as const;

export const ALLOWED_AUDIO_ENCODINGS = ['MP3', 'LINEAR16', 'OGG_OPUS'] as const;

// Reasonable ranges based on actual usage (with some buffer for future adjustments)
export const SPEAKING_RATE_RANGE = { min: 0.5, max: 1.5 } as const;
export const PITCH_RANGE = { min: 0.5, max: 2.0 } as const;
export const VOLUME_RANGE = { min: -10, max: 10 } as const;

interface VoiceOptions {
  languageCode?: string;
  name?: string;
  ssmlGender?: string;
}

interface AudioConfig {
  audioEncoding?: string;
  speakingRate?: number;
  pitch?: number;
  volumeGainDb?: number;
}

interface TTSRequestOptions {
  voice?: VoiceOptions;
  audioConfig?: AudioConfig;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate TTS request options against allowlists
 */
export function validateTTSOptions(options?: TTSRequestOptions): ValidationResult {
  if (!options) {
    return { valid: true }; // Options are optional, defaults will be used
  }

  // Validate voice options
  if (options.voice) {
    const { languageCode, ssmlGender } = options.voice;

    if (languageCode && !ALLOWED_LANGUAGES.includes(languageCode as any)) {
      return {
        valid: false,
        error: `Language '${languageCode}' is not allowed. Allowed languages: ${ALLOWED_LANGUAGES.join(', ')}`,
      };
    }

    if (ssmlGender && !ALLOWED_GENDERS.includes(ssmlGender as any)) {
      return {
        valid: false,
        error: `Gender '${ssmlGender}' is not allowed. Allowed genders: ${ALLOWED_GENDERS.join(', ')}`,
      };
    }
  }

  // Validate audio config
  if (options.audioConfig) {
    const { audioEncoding, speakingRate, pitch, volumeGainDb } = options.audioConfig;

    if (audioEncoding && !ALLOWED_AUDIO_ENCODINGS.includes(audioEncoding as any)) {
      return {
        valid: false,
        error: `Audio encoding '${audioEncoding}' is not allowed. Allowed encodings: ${ALLOWED_AUDIO_ENCODINGS.join(', ')}`,
      };
    }

    if (speakingRate !== undefined) {
      if (speakingRate < SPEAKING_RATE_RANGE.min || speakingRate > SPEAKING_RATE_RANGE.max) {
        return {
          valid: false,
          error: `Speaking rate ${speakingRate} is out of allowed range [${SPEAKING_RATE_RANGE.min}, ${SPEAKING_RATE_RANGE.max}]`,
        };
      }
    }

    if (pitch !== undefined) {
      if (pitch < PITCH_RANGE.min || pitch > PITCH_RANGE.max) {
        return {
          valid: false,
          error: `Pitch ${pitch} is out of allowed range [${PITCH_RANGE.min}, ${PITCH_RANGE.max}]`,
        };
      }
    }

    if (volumeGainDb !== undefined) {
      if (volumeGainDb < VOLUME_RANGE.min || volumeGainDb > VOLUME_RANGE.max) {
        return {
          valid: false,
          error: `Volume gain ${volumeGainDb}dB is out of allowed range [${VOLUME_RANGE.min}, ${VOLUME_RANGE.max}]dB`,
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Get allowed origins from environment configuration
 * 
 * Expected env vars:
 * - NEXT_PUBLIC_APP_URL: Production URL (e.g., https://helloailearning.com)
 * - VERCEL_URL: Preview deployments (set automatically by Vercel)
 * 
 * In development, localhost on any port is allowed.
 */
export function getAllowedOrigins(): string[] {
  const origins: string[] = [];

  // Production URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    origins.push(process.env.NEXT_PUBLIC_APP_URL);
  }

  // Vercel preview deployments
  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`);
  }

  // Development - allow localhost on any port
  if (process.env.NODE_ENV === 'development') {
    origins.push('http://localhost');
  }

  return origins;
}

/**
 * Validate request origin
 * 
 * Checks Origin header (for CORS requests) and Referer header (fallback).
 * In browsers, legitimate same-origin requests will have one or both set.
 */
export function validateOrigin(request: Request): ValidationResult {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const allowedOrigins = getAllowedOrigins();

  // If no origin/referer headers, reject (possible server-to-server request)
  if (!origin && !referer) {
    return {
      valid: false,
      error: 'Missing origin and referer headers',
    };
  }

  const requestOrigin = origin || (referer ? new URL(referer).origin : null);

  if (!requestOrigin) {
    return {
      valid: false,
      error: 'Unable to determine request origin',
    };
  }

  // Check if origin matches any allowed origin
  const isAllowed = allowedOrigins.some((allowed) => {
    // Exact match
    if (requestOrigin === allowed) {
      return true;
    }

    // For localhost in dev, allow any port
    if (
      process.env.NODE_ENV === 'development' &&
      allowed === 'http://localhost' &&
      requestOrigin.startsWith('http://localhost:')
    ) {
      return true;
    }

    return false;
  });

  if (!isAllowed) {
    return {
      valid: false,
      error: `Origin '${requestOrigin}' is not allowed`,
    };
  }

  return { valid: true };
}
