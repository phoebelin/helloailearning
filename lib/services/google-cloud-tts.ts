/**
 * Google Cloud Text-to-Speech Service
 * Provides high-quality TTS using Google Cloud API
 */

import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// Initialize the client
let client: TextToSpeechClient | null = null;

function getClient(): TextToSpeechClient | null {
  if (client) return client;
  
  try {
    // Check if we have the required environment variables
    if (!process.env.GOOGLE_CLOUD_PROJECT_ID || !process.env.GOOGLE_CLOUD_PRIVATE_KEY) {
      console.warn('Google Cloud TTS: Missing environment variables');
      return null;
    }
    
    client = new TextToSpeechClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    });
    
    return client;
  } catch (error) {
    console.error('Google Cloud TTS: Failed to initialize client:', error);
    return null;
  }
}

export interface GoogleCloudTTSOptions {
  voice?: {
    languageCode?: string;
    name?: string;
    ssmlGender?: 'MALE' | 'FEMALE' | 'NEUTRAL';
  };
  audioConfig?: {
    audioEncoding?: 'MP3' | 'LINEAR16' | 'OGG_OPUS';
    speakingRate?: number;
    pitch?: number;
    volumeGainDb?: number;
  };
}

export interface GoogleCloudTTSResult {
  success: boolean;
  audioData?: string; // Base64 encoded audio
  error?: string;
}

/**
 * Convert text to speech using Google Cloud TTS
 */
export async function synthesizeSpeech(
  text: string,
  options: GoogleCloudTTSOptions = {}
): Promise<GoogleCloudTTSResult> {
  const ttsClient = getClient();
  
  if (!ttsClient) {
    return {
      success: false,
      error: 'Google Cloud TTS client not available',
    };
  }

  try {
    const request = {
      input: { text },
      voice: {
        languageCode: options.voice?.languageCode || 'en-US',
        name: options.voice?.name || 'en-US-Wavenet-F', // Female voice for child-friendly experience
        ssmlGender: options.voice?.ssmlGender || 'FEMALE',
      },
      audioConfig: {
        audioEncoding: options.audioConfig?.audioEncoding || 'MP3',
        speakingRate: options.audioConfig?.speakingRate || 0.9, // Slightly slower for children
        pitch: options.audioConfig?.pitch || 1.1, // Slightly higher pitch
        volumeGainDb: options.audioConfig?.volumeGainDb || 0,
      },
    };

    console.log('Google Cloud TTS: Synthesizing speech for text:', text.substring(0, 50) + '...');
    
    const [response] = await ttsClient.synthesizeSpeech(request);
    
    if (!response.audioContent) {
      return {
        success: false,
        error: 'No audio content received from Google Cloud TTS',
      };
    }

    // Convert audio content to base64
    const audioData = Buffer.from(response.audioContent).toString('base64');
    
    console.log('Google Cloud TTS: Successfully synthesized speech');
    
    return {
      success: true,
      audioData,
    };
  } catch (error) {
    console.error('Google Cloud TTS: Error synthesizing speech:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if Google Cloud TTS is available
 */
export function isGoogleCloudTTSAvailable(): boolean {
  return getClient() !== null;
}
