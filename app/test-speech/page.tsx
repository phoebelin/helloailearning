/**
 * Test Page for Speech Recognition and Audio Features
 * TEMPORARY - For manual testing during development
 * TODO: Remove before production deployment
 */

'use client';

import React, { useState } from 'react';
import { AudioRecorder, AudioRecorderCompact } from '@/components/activity/audio-recorder';
import { 
  MicrophonePermissionDialog, 
  useMicrophonePermission 
} from '@/components/activity/microphone-permission-dialog';
import {
  SpeechFallback,
  SpeechUnavailableAlert,
  SpeechInputWithFallback,
  InlineSpeechFallbackNotice,
  SpeechUnavailableBanner
} from '@/components/activity/speech-fallback';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';
import { Button } from '@/components/ui/button';
import { 
  cleanTranscript, 
  extractEcosystemFromTranscript,
  getSpeechSummary 
} from '@/lib/utils/speech-utils';

export default function TestSpeechPage() {
  const [activeTab, setActiveTab] = useState('audio-recorder');
  const [transcript1, setTranscript1] = useState('');
  const [transcript2, setTranscript2] = useState('');
  const [fallbackText, setFallbackText] = useState('');
  const [ttsText, setTtsText] = useState('Hello! I am Zhorai, your AI learning companion.');
  const [testResults, setTestResults] = useState<string[]>([]);

  const { 
    permissionState, 
    isDialogOpen, 
    openDialog, 
    closeDialog 
  } = useMicrophonePermission();

  const {
    speak,
    stop,
    isSpeaking,
    isPaused,
    pause,
    resume,
    voices,
    selectedVoice,
    setVoice,
    queueLength,
  } = useTextToSpeech();

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const handleTranscript1Change = (text: string, isFinal: boolean) => {
    setTranscript1(text);
    if (isFinal) {
      addTestResult(`Final transcript: "${text}"`);
      
      // Test ecosystem extraction
      const ecosystem = extractEcosystemFromTranscript(text);
      if (ecosystem) {
        addTestResult(`Detected ecosystem: ${ecosystem}`);
      }
    }
  };

  const handleSpeakTTS = () => {
    speak(ttsText);
    addTestResult(`Speaking: "${ttsText}"`);
  };

  const handleTestUtilities = () => {
    const testText = 'um, like, Hello world! This is, you know, a test.';
    const cleaned = cleanTranscript(testText);
    addTestResult(`Cleaned: "${testText}" -> "${cleaned}"`);
    
    const summary = getSpeechSummary(testText, 0.85, 3000);
    addTestResult(`Summary: ${summary.wordCount} words, ${summary.speechRate} WPM`);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Speech Features Test Page</h1>
          <p className="text-muted-foreground">
            Test and verify all speech recognition and audio features
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className={`px-2 py-1 rounded ${
              permissionState === 'granted' ? 'bg-green-100 text-green-800' :
              permissionState === 'denied' ? 'bg-red-100 text-red-800' :
              permissionState === 'unavailable' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              Microphone: {permissionState}
            </span>
            <Button variant="outline" size="sm" onClick={openDialog}>
              Request Permission
            </Button>
          </div>
        </div>

        {/* Banner Test */}
        <SpeechUnavailableBanner onDismiss={() => addTestResult('Banner dismissed')} />

        {/* Main Content */}
        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex gap-2 border-b">
            {[
              { id: 'audio-recorder', label: 'Audio Recorder' },
              { id: 'tts', label: 'Text-to-Speech' },
              { id: 'fallback', label: 'Fallback UI' },
              { id: 'utilities', label: 'Utilities' },
              { id: 'results', label: 'Test Results' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-foreground border-b-2 border-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Audio Recorder Tab */}
          {activeTab === 'audio-recorder' && (
            <div className="space-y-6">
              <div className="p-6 border rounded-lg bg-card">
                <h2 className="text-2xl font-semibold mb-4">Full Audio Recorder</h2>
              <AudioRecorder
                showTranscript
                placeholder="Press and speak to test..."
                onTranscriptChange={handleTranscript1Change}
                onStart={() => addTestResult('Recording started')}
                onStop={() => addTestResult('Recording stopped')}
                onError={(error) => addTestResult(`Error: ${error}`)}
              />
              {transcript1 && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Captured Transcript:</p>
                  <p className="text-sm">{transcript1}</p>
                </div>
              )}
            </div>

            <div className="p-6 border rounded-lg bg-card">
              <h2 className="text-2xl font-semibold mb-4">Compact Audio Recorder</h2>
              <div className="flex items-center gap-4">
                <AudioRecorderCompact
                  onTranscriptChange={(text, isFinal) => {
                    setTranscript2(text);
                    if (isFinal) {
                      addTestResult(`Compact recorder: "${text}"`);
                    }
                  }}
                  onError={(error) => addTestResult(`Compact error: ${error}`)}
                />
                <span className="text-sm text-muted-foreground">
                  Transcript: {transcript2 || 'None yet'}
                </span>
              </div>
            </div>

            <div className="p-6 border rounded-lg bg-card">
              <h2 className="text-2xl font-semibold mb-4">Auto-stop Mode</h2>
              <AudioRecorder
                showTranscript
                placeholder="Speak once and it will auto-stop..."
                autoStop
                continuous={false}
                onTranscriptChange={(text, isFinal) => {
                  if (isFinal) {
                    addTestResult(`Auto-stop captured: "${text}"`);
                  }
                }}
              />
            </div>
          </div>
          )}

          {/* Text-to-Speech Tab */}
          {activeTab === 'tts' && (
            <div className="space-y-6">
              <div className="p-6 border rounded-lg bg-card">
                <h2 className="text-2xl font-semibold mb-4">Text-to-Speech</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Text to speak:
                  </label>
                  <textarea
                    value={ttsText}
                    onChange={(e) => setTtsText(e.target.value)}
                    className="w-full h-24 px-3 py-2 border rounded-md"
                    placeholder="Enter text to speak..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button onClick={handleSpeakTTS} disabled={isSpeaking}>
                    Speak
                  </Button>
                  <Button onClick={pause} disabled={!isSpeaking || isPaused} variant="outline">
                    Pause
                  </Button>
                  <Button onClick={resume} disabled={!isPaused} variant="outline">
                    Resume
                  </Button>
                  <Button onClick={stop} disabled={!isSpeaking} variant="destructive">
                    Stop
                  </Button>
                  <span className="text-sm text-muted-foreground ml-4">
                    {isSpeaking ? (isPaused ? 'Paused' : 'Speaking') : 'Idle'} | Queue: {queueLength}
                  </span>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Selected Voice: {selectedVoice?.name || 'Default'}
                  </label>
                  <select
                    value={selectedVoice?.name || ''}
                    onChange={(e) => {
                      const voice = voices.find(v => v.name === e.target.value);
                      setVoice(voice || null);
                    }}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    {voices.map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Quick Tests:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        speak('Desert ecosystems are hot and dry.');
                        speak('Ocean ecosystems are wet and salty.');
                        speak('Rainforests are wet and green.');
                      }}
                    >
                      Test Queue (3 items)
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => speak('This is a test', { rate: 0.5 })}
                    >
                      Slow Speech
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => speak('This is a test', { rate: 1.5 })}
                    >
                      Fast Speech
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => speak('This is a test', { pitch: 1.5 })}
                    >
                      High Pitch
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Fallback UI Tab */}
          {activeTab === 'fallback' && (
            <div className="space-y-6">
              <div className="p-6 border rounded-lg bg-card">
                <h2 className="text-2xl font-semibold mb-4">Fallback Components</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Speech Unavailable Alert</h3>
                  <SpeechUnavailableAlert />
                </div>

                <div>
                  <h3 className="font-medium mb-2">Inline Notice</h3>
                  <InlineSpeechFallbackNotice />
                </div>

                <div>
                  <h3 className="font-medium mb-2">Speech Fallback Input</h3>
                  <SpeechFallback
                    onSubmit={(text) => {
                      setFallbackText(text);
                      addTestResult(`Fallback input: "${text}"`);
                    }}
                    showMessage
                  />
                  {fallbackText && (
                    <p className="mt-2 text-sm">Last submitted: {fallbackText}</p>
                  )}
                </div>

                <div>
                  <h3 className="font-medium mb-2">Combined Input with Fallback</h3>
                  <SpeechInputWithFallback
                    speechComponent={
                      <AudioRecorder
                        showTranscript
                        onTranscriptChange={(text) => addTestResult(`Combined: "${text}"`)}
                      />
                    }
                    onTextSubmit={(text) => addTestResult(`Combined fallback: "${text}"`)}
                  />
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Utilities Tab */}
          {activeTab === 'utilities' && (
            <div className="space-y-6">
              <div className="p-6 border rounded-lg bg-card">
                <h2 className="text-2xl font-semibold mb-4">Speech Utilities</h2>
              
              <div className="space-y-4">
                <Button onClick={handleTestUtilities}>
                  Test Text Cleaning & Analysis
                </Button>

                <div>
                  <h3 className="font-medium mb-2">Test Ecosystem Detection:</h3>
                  <div className="space-y-2">
                    {[
                      'I want to learn about the ocean',
                      'Tell me about deserts',
                      'What lives in the rainforest?',
                      'Grasslands and savannas',
                      'The frozen tundra is cold'
                    ].map((text, i) => (
                      <Button
                        key={i}
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const ecosystem = extractEcosystemFromTranscript(text);
                          addTestResult(`"${text}" -> ${ecosystem || 'none'}`);
                        }}
                      >
                        Test: "{text}"
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div className="space-y-6">
              <div className="p-6 border rounded-lg bg-card">
                <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Test Results Log</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setTestResults([])}
                >
                  Clear Log
                </Button>
              </div>
              
              <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm h-96 overflow-y-auto">
                {testResults.length === 0 ? (
                  <p className="text-gray-500">No test results yet. Try the features above!</p>
                ) : (
                  testResults.map((result, i) => (
                    <div key={i} className="mb-1">
                      {result}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Permission Dialog */}
      <MicrophonePermissionDialog
        isOpen={isDialogOpen}
        onClose={closeDialog}
        onPermissionGranted={() => addTestResult('Permission granted!')}
        onPermissionDenied={() => addTestResult('Permission denied!')}
      />
    </div>
  );
}

