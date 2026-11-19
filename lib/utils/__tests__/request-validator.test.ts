/**
 * Tests for request validator utility
 */

import {
  validateTTSOptions,
  validateOrigin,
  getAllowedOrigins,
  ALLOWED_LANGUAGES,
  ALLOWED_GENDERS,
  ALLOWED_AUDIO_ENCODINGS,
} from '../request-validator';
import { NextRequest } from 'next/server';

describe('request-validator', () => {
  describe('validateTTSOptions', () => {
    it('should accept valid options used by the app', () => {
      const options = {
        voice: {
          languageCode: 'en-US',
          ssmlGender: 'FEMALE',
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.9,
          pitch: 1.1,
          volumeGainDb: 0,
        },
      };

      const result = validateTTSOptions(options);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept undefined options (will use defaults)', () => {
      const result = validateTTSOptions(undefined);
      expect(result.valid).toBe(true);
    });

    it('should accept empty options object', () => {
      const result = validateTTSOptions({});
      expect(result.valid).toBe(true);
    });

    it('should accept partial options', () => {
      const result = validateTTSOptions({
        voice: { languageCode: 'en-US' },
      });
      expect(result.valid).toBe(true);
    });

    it('should reject disallowed language', () => {
      const options = {
        voice: { languageCode: 'es-ES' },
      };

      const result = validateTTSOptions(options);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Language');
      expect(result.error).toContain('es-ES');
    });

    it('should reject disallowed gender', () => {
      const options = {
        voice: { ssmlGender: 'ROBOT' },
      };

      const result = validateTTSOptions(options);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Gender');
      expect(result.error).toContain('ROBOT');
    });

    it('should reject disallowed audio encoding', () => {
      const options = {
        audioConfig: { audioEncoding: 'WAV' },
      };

      const result = validateTTSOptions(options);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Audio encoding');
      expect(result.error).toContain('WAV');
    });

    it('should reject speaking rate out of range', () => {
      const tooLow = validateTTSOptions({
        audioConfig: { speakingRate: 0.3 },
      });
      expect(tooLow.valid).toBe(false);
      expect(tooLow.error).toContain('Speaking rate');

      const tooHigh = validateTTSOptions({
        audioConfig: { speakingRate: 2.0 },
      });
      expect(tooHigh.valid).toBe(false);
      expect(tooHigh.error).toContain('Speaking rate');
    });

    it('should reject pitch out of range', () => {
      const tooLow = validateTTSOptions({
        audioConfig: { pitch: 0.3 },
      });
      expect(tooLow.valid).toBe(false);
      expect(tooLow.error).toContain('Pitch');

      const tooHigh = validateTTSOptions({
        audioConfig: { pitch: 2.5 },
      });
      expect(tooHigh.valid).toBe(false);
      expect(tooHigh.error).toContain('Pitch');
    });

    it('should reject volume gain out of range', () => {
      const tooLow = validateTTSOptions({
        audioConfig: { volumeGainDb: -15 },
      });
      expect(tooLow.valid).toBe(false);
      expect(tooLow.error).toContain('Volume gain');

      const tooHigh = validateTTSOptions({
        audioConfig: { volumeGainDb: 15 },
      });
      expect(tooHigh.valid).toBe(false);
      expect(tooHigh.error).toContain('Volume gain');
    });

    it('should accept all edge values within allowed ranges', () => {
      const minValues = validateTTSOptions({
        audioConfig: {
          speakingRate: 0.5,
          pitch: 0.5,
          volumeGainDb: -10,
        },
      });
      expect(minValues.valid).toBe(true);

      const maxValues = validateTTSOptions({
        audioConfig: {
          speakingRate: 1.5,
          pitch: 2.0,
          volumeGainDb: 10,
        },
      });
      expect(maxValues.valid).toBe(true);
    });

    it('should accept actual usage patterns from Zhorai lesson', () => {
      // Pattern from components/activity/animal-selection-step.tsx
      const zhoraiPattern = {
        voice: {
          languageCode: 'en-US',
          ssmlGender: 'FEMALE',
        },
        audioConfig: {
          speakingRate: 0.9,
          pitch: 1.1,
          volumeGainDb: 0,
        },
      };

      const result = validateTTSOptions(zhoraiPattern);
      expect(result.valid).toBe(true);
    });

    it('should accept actual usage patterns from Coda lesson', () => {
      // Pattern from components/activities/coda/meet-coda-step.tsx
      const codaPattern = {
        voice: {
          languageCode: 'en-US',
          ssmlGender: 'FEMALE',
        },
        audioConfig: {
          speakingRate: 0.88,
          pitch: 1.15,
          volumeGainDb: 0,
        },
      };

      const result = validateTTSOptions(codaPattern);
      expect(result.valid).toBe(true);
    });
  });

  describe('getAllowedOrigins', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should include production URL when set', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://helloailearning.com';
      const origins = getAllowedOrigins();
      expect(origins).toContain('https://helloailearning.com');
    });

    it('should include Vercel URL when set', () => {
      process.env.VERCEL_URL = 'my-app-abc123.vercel.app';
      const origins = getAllowedOrigins();
      expect(origins).toContain('https://my-app-abc123.vercel.app');
    });

    it('should include localhost in development', () => {
      process.env.NODE_ENV = 'development';
      const origins = getAllowedOrigins();
      expect(origins).toContain('http://localhost');
    });

    it('should not include localhost in production', () => {
      process.env.NODE_ENV = 'production';
      const origins = getAllowedOrigins();
      expect(origins).not.toContain('http://localhost');
    });
  });

  describe('validateOrigin', () => {
    const originalEnv = process.env;

    function createMockRequest(headers: Record<string, string>): Request {
      return {
        headers: {
          get: (name: string) => headers[name] || null,
        },
      } as Request;
    }

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv, NODE_ENV: 'development' };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should accept request with valid origin header in development', () => {
      const request = createMockRequest({
        origin: 'http://localhost:3000',
      });

      const result = validateOrigin(request);
      expect(result.valid).toBe(true);
    });

    it('should accept request with valid referer header in development', () => {
      const request = createMockRequest({
        referer: 'http://localhost:3000/lessons/how-machines-learn',
      });

      const result = validateOrigin(request);
      expect(result.valid).toBe(true);
    });

    it('should accept localhost with any port in development', () => {
      const ports = [3000, 3001, 8080, 9000];

      ports.forEach((port) => {
        const request = createMockRequest({
          origin: `http://localhost:${port}`,
        });

        const result = validateOrigin(request);
        expect(result.valid).toBe(true);
      });
    });

    it('should reject request with no origin or referer', () => {
      const request = createMockRequest({});

      const result = validateOrigin(request);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Missing origin and referer');
    });

    it('should reject request from disallowed origin', () => {
      const request = createMockRequest({
        origin: 'https://malicious-site.com',
      });

      const result = validateOrigin(request);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    it('should accept production URL when configured', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://helloailearning.com';

      const request = createMockRequest({
        origin: 'https://helloailearning.com',
      });

      const result = validateOrigin(request);
      expect(result.valid).toBe(true);
    });

    it('should accept Vercel preview URL when configured', () => {
      process.env.VERCEL_URL = 'my-app-abc123.vercel.app';

      const request = createMockRequest({
        origin: 'https://my-app-abc123.vercel.app',
      });

      const result = validateOrigin(request);
      expect(result.valid).toBe(true);
    });

    it('should reject localhost in production mode', () => {
      process.env.NODE_ENV = 'production';

      const request = createMockRequest({
        origin: 'http://localhost:3000',
      });

      const result = validateOrigin(request);
      expect(result.valid).toBe(false);
    });
  });
});
