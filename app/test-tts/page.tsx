/**
 * Simple Text-to-Speech Test Page
 * For debugging TTS issues
 */

'use client';

import React, { useState } from 'react';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';

export default function TestTTSPage() {
  const [testText, setTestText] = useState('Hello! This is a test of text-to-speech functionality.');
  const { speak, isSupported, isSpeaking, voices, selectedVoice } = useTextToSpeech();

  const handleSpeak = () => {
    console.log('Test TTS: Attempting to speak:', testText);
    console.log('Test TTS: isSupported:', isSupported);
    console.log('Test TTS: voices count:', voices.length);
    console.log('Test TTS: selected voice:', selectedVoice?.name);
    
    speak(testText, {
      onStart: () => console.log('Test TTS: Speech started'),
      onEnd: () => console.log('Test TTS: Speech ended'),
      onError: (error) => console.error('Test TTS: Speech error:', error),
    });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Text-to-Speech Test</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Text to speak:
            </label>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full h-24 px-3 py-2 border rounded-md"
              placeholder="Enter text to speak..."
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSpeak}
              disabled={!isSupported || isSpeaking}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {isSpeaking ? 'Speaking...' : 'Speak'}
            </button>
            
            <div className="text-sm text-gray-600">
              Status: {isSupported ? 'Supported' : 'Not Supported'} | 
              Speaking: {isSpeaking ? 'Yes' : 'No'} | 
              Voices: {voices.length}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Available Voices:</h3>
            <div className="max-h-32 overflow-y-auto border rounded p-2">
              {voices.length > 0 ? (
                voices.map((voice, index) => (
                  <div key={index} className="text-sm py-1">
                    {voice.name} ({voice.lang}) {voice === selectedVoice ? '✓' : ''}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No voices available</div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Browser Info:</h3>
            <div className="text-sm text-gray-600">
              <div>User Agent: {typeof window !== 'undefined' ? navigator.userAgent : 'N/A'}</div>
              <div>Speech Synthesis: {typeof window !== 'undefined' && 'speechSynthesis' in window ? 'Available' : 'Not Available'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
