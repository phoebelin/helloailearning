/**
 * Tests for TTS API route with security features
 */

import { POST, GET } from '../route';
import { ttsRateLimiter } from '@/lib/utils/rate-limiter';
import { createTestRequest } from './test-helpers';

// Mock the Google Cloud TTS service
jest.mock('@/lib/services/google-cloud-tts', () => ({
  synthesizeSpeech: jest.fn(),
  GoogleCloudTTSOptions: {},
}));

import { synthesizeSpeech } from '@/lib/services/google-cloud-tts';

describe('/api/tts', () => {
  const mockSynthesizeSpeech = synthesizeSpeech as jest.MockedFunction<typeof synthesizeSpeech>;

  beforeEach(() => {
    jest.clearAllMocks();
    ttsRateLimiter.reset();
    process.env.NODE_ENV = 'development';
  });

  afterAll(() => {
    ttsRateLimiter.destroy();
  });

  describe('GET', () => {
    it('should return API information', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBeDefined();
      expect(data.methods).toContain('POST');
    });
  });

  describe('POST - security checks', () => {
    it('should reject request with no origin/referer', async () => {
      const request = createTestRequest('http://localhost:3000/api/tts', {
        headers: {
          'Content-Type': 'application/json',
        },
        body: { text: 'Hello world' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Forbidden');
    });

    it('should reject request from disallowed origin', async () => {
      const request = createTestRequest('http://localhost:3000/api/tts', {
        headers: {
          'Content-Type': 'application/json',
          origin: 'https://malicious-site.com',
        },
        body: { text: 'Hello world' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Forbidden');
    });

    it('should accept request with valid localhost origin in development', async () => {
      mockSynthesizeSpeech.mockResolvedValueOnce({
        success: true,
        audioData: 'base64-audio-data',
      });

      const request = createTestRequest('http://localhost:3000/api/tts', {
        headers: {
          'Content-Type': 'application/json',
          origin: 'http://localhost:3000',
          'x-forwarded-for': '127.0.0.1',
        },
        body: { text: 'Hello world' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should rate limit excessive requests from same IP', async () => {
      mockSynthesizeSpeech.mockResolvedValue({
        success: true,
        audioData: 'base64-audio-data',
      });

      // Make 600 successful requests (the limit)
      for (let i = 0; i < 600; i++) {
        const request = createTestRequest('http://localhost:3000/api/tts', {
          headers: {
            'Content-Type': 'application/json',
            origin: 'http://localhost:3000',
            host: 'localhost:3000',
            'x-forwarded-for': '192.168.1.1',
          },
          body: { text: `Test ${i}` },
        });

        const response = await POST(request);
        expect(response.status).toBe(200);
      }

      // 601st request should be rate limited
      const blockedRequest = createTestRequest('http://localhost:3000/api/tts', {
        headers: {
          'Content-Type': 'application/json',
          origin: 'http://localhost:3000',
          host: 'localhost:3000',
          'x-forwarded-for': '192.168.1.1',
        },
        body: { text: 'Should be blocked' },
      });

      const blockedResponse = await POST(blockedRequest);
      const blockedData = await blockedResponse.json();

      expect(blockedResponse.status).toBe(429);
      expect(blockedData.error).toContain('Too many requests');
      expect(blockedResponse.headers.get('Retry-After')).toBeDefined();
    });

    it('should reject invalid voice options', async () => {
      const request = createTestRequest('http://localhost:3000/api/tts', {
        headers: {
          'Content-Type': 'application/json',
          origin: 'http://localhost:3000',
          'x-forwarded-for': '127.0.0.1',
        },
        body: {
          text: 'Hello',
          options: {
            voice: { languageCode: 'fr-FR' },
          },
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid options');
      expect(data.error).toContain('Language');
    });

    it('should reject invalid speaking rate', async () => {
      const request = createTestRequest('http://localhost:3000/api/tts', {
        headers: {
          'Content-Type': 'application/json',
          origin: 'http://localhost:3000',
          'x-forwarded-for': '127.0.0.1',
        },
        body: {
          text: 'Hello',
          options: {
            audioConfig: { speakingRate: 3.0 },
          },
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid options');
      expect(data.error).toContain('Speaking rate');
    });
  });

  describe('POST - input validation', () => {
    const createValidRequest = (body: unknown) => {
      return createTestRequest('http://localhost:3000/api/tts', {
        headers: {
          'Content-Type': 'application/json',
          origin: 'http://localhost:3000',
          'x-forwarded-for': '127.0.0.1',
        },
        body,
      });
    };

    it('should reject request with missing text', async () => {
      const request = createValidRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Text is required');
    });

    it('should reject request with non-string text', async () => {
      const request = createValidRequest({ text: 123 });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Text is required');
    });

    it('should reject request with text exceeding limit', async () => {
      const longText = 'a'.repeat(5001);
      const request = createValidRequest({ text: longText });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Text too long');
    });

    it('should accept text at the limit', async () => {
      mockSynthesizeSpeech.mockResolvedValueOnce({
        success: true,
        audioData: 'base64-audio-data',
      });

      const maxText = 'a'.repeat(5000);
      const request = createValidRequest({ text: maxText });
      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe('POST - TTS synthesis', () => {
    const createValidRequest = (body: unknown) => {
      return createTestRequest('http://localhost:3000/api/tts', {
        headers: {
          'Content-Type': 'application/json',
          origin: 'http://localhost:3000',
          'x-forwarded-for': '127.0.0.1',
        },
        body,
      });
    };

    it('should successfully synthesize speech with valid input', async () => {
      mockSynthesizeSpeech.mockResolvedValueOnce({
        success: true,
        audioData: 'base64-audio-data',
      });

      const request = createValidRequest({
        text: 'Hello world',
        options: {
          voice: { languageCode: 'en-US', ssmlGender: 'FEMALE' },
          audioConfig: { speakingRate: 0.9, pitch: 1.1 },
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.audioData).toBe('base64-audio-data');
      expect(data.mimeType).toBe('audio/mpeg');
      expect(mockSynthesizeSpeech).toHaveBeenCalledWith('Hello world', expect.any(Object));
    });

    it('should handle synthesis failure', async () => {
      mockSynthesizeSpeech.mockResolvedValueOnce({
        success: false,
        error: 'Google Cloud TTS not available',
      });

      const request = createValidRequest({ text: 'Hello world' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to synthesize speech');
    });

    it('should accept actual Zhorai lesson options', async () => {
      mockSynthesizeSpeech.mockResolvedValueOnce({
        success: true,
        audioData: 'base64-audio-data',
      });

      const request = createValidRequest({
        text: 'Welcome to the ecosystem learning activity!',
        options: {
          voice: {
            languageCode: 'en-US',
            ssmlGender: 'FEMALE',
          },
          audioConfig: {
            speakingRate: 0.9,
            pitch: 1.1,
            volumeGainDb: 0,
          },
        },
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('should accept actual Coda lesson options', async () => {
      mockSynthesizeSpeech.mockResolvedValueOnce({
        success: true,
        audioData: 'base64-audio-data',
      });

      const request = createValidRequest({
        text: 'Hi! I\'m Coda.',
        options: {
          voice: {
            languageCode: 'en-US',
            ssmlGender: 'FEMALE',
          },
          audioConfig: {
            speakingRate: 0.88,
            pitch: 1.15,
            volumeGainDb: 0,
          },
        },
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });
});
