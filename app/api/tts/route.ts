/**
 * API Route for Google Cloud Text-to-Speech
 * Handles TTS requests from the frontend with security controls
 */

import { NextRequest, NextResponse } from 'next/server';
import { synthesizeSpeech, GoogleCloudTTSOptions } from '@/lib/services/google-cloud-tts';
import { ttsRateLimiter, getClientIp } from '@/lib/utils/rate-limiter';
import { validateOrigin, validateTTSOptions } from '@/lib/utils/request-validator';

export async function POST(request: NextRequest) {
  try {
    // Security check 1: Validate origin
    const originValidation = validateOrigin(request);
    if (!originValidation.valid) {
      console.warn('TTS API: Origin validation failed:', originValidation.error);
      return NextResponse.json(
        { error: 'Forbidden: Invalid origin' },
        { status: 403 }
      );
    }

    // Security check 2: Rate limiting
    const clientIp = getClientIp(request);
    const rateLimitResult = ttsRateLimiter.check(clientIp);
    
    if (!rateLimitResult.allowed) {
      console.warn('TTS API: Rate limit exceeded for IP:', clientIp);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
          },
        }
      );
    }

    const body = await request.json();
    const { text, options = {} } = body;

    // Validate text input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text too long. Maximum 5000 characters.' },
        { status: 400 }
      );
    }

    // Security check 3: Validate TTS options against allowlists
    const optionsValidation = validateTTSOptions(options);
    if (!optionsValidation.valid) {
      console.warn('TTS API: Options validation failed:', optionsValidation.error);
      return NextResponse.json(
        { error: `Invalid options: ${optionsValidation.error}` },
        { status: 400 }
      );
    }

    console.log('TTS API: Processing TTS request, text length:', text.length);

    const result = await synthesizeSpeech(text, options as GoogleCloudTTSOptions);

    if (!result.success) {
      console.error('TTS API: Synthesis failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to synthesize speech' },
        { status: 500 }
      );
    }

    console.log('TTS API: Successfully synthesized speech');

    return NextResponse.json({
      success: true,
      audioData: result.audioData,
      mimeType: 'audio/mpeg', // MP3 format
    });
  } catch (error) {
    console.error('TTS API: Unexpected error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Google Cloud TTS API endpoint',
    methods: ['POST'],
    usage: 'Send POST request with { text: string, options?: GoogleCloudTTSOptions }',
  });
}
