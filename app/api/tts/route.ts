/**
 * API Route for Google Cloud Text-to-Speech
 * Handles TTS requests from the frontend
 */

import { NextRequest, NextResponse } from 'next/server';
import { synthesizeSpeech, GoogleCloudTTSOptions } from '@/lib/services/google-cloud-tts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, options = {} } = body;

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

    console.log('TTS API: Processing request for text:', text.substring(0, 50) + '...');

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
    console.error('TTS API: Unexpected error:', error);
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
