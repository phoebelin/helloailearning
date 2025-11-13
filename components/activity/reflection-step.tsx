/**
 * Reflection Step Component
 * Figma: Desktop-22
 * Final reflection step where users reflect on what they learned
 * Based on PRD: 0001-prd-ecosystem-learning-activity.md - Task 5.9
 */

'use client';

import React, { useState } from 'react';
import { StepComponentProps } from '@/types/activity';
import { AudioRecorder } from './audio-recorder';
import { useEnhancedTextToSpeech } from '@/hooks/use-enhanced-text-to-speech';
import { Volume2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export interface ReflectionStepProps extends StepComponentProps {}

/**
 * Reflection Step Component
 */
export function ReflectionStep({
  onNext,
  onPrevious,
}: ReflectionStepProps) {
  const [response1, setResponse1] = useState('');
  const [response2, setResponse2] = useState('');
  const [currentTranscript1, setCurrentTranscript1] = useState('');
  const [currentTranscript2, setCurrentTranscript2] = useState('');
  const [isRecording1, setIsRecording1] = useState(false);
  const [isRecording2, setIsRecording2] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Check if both responses have been added
  const hasBothResponses = response1.trim().length > 0 && response2.trim().length > 0;

  const { speak, isSpeaking } = useEnhancedTextToSpeech({
    rate: 0.9,
    pitch: 1.1,
    useGoogleCloud: true,
  });

  const question1 = "If you asked Zhorai about any random animal, do you think Zhorai would be able to guess which ecosystem it is from? Why or why not?";
  const question2 = "Do you think Zhorai's knowledge of the world is biased or not? How can we improve Zhorai's brain?";

  const handleSpeakQuestion1 = () => {
    speak(question1, {
      onError: (error) => {
        if (error !== 'canceled') {
          console.warn('Speech synthesis error:', error);
        }
      }
    });
  };

  const handleSpeakQuestion2 = () => {
    speak(question2, {
      onError: (error) => {
        if (error !== 'canceled') {
          console.warn('Speech synthesis error:', error);
        }
      }
    });
  };

  const handleComplete = () => {
    setShowCelebration(true);
    // Hide celebration after animation
    setTimeout(() => {
      setShowCelebration(false);
    }, 3000);
  };

  return (
    <div className="relative min-h-screen bg-white">
      {/* Main content */}
      <div className="pt-20 pb-20 px-4 max-w-[682px] mx-auto relative">
        {/* Heading */}
        <h1 className="font-normal text-gray-900 mb-8" style={{ fontSize: '16px', fontWeight: 400 }}>
          Thanks for teaching me so much about animals! Now let&apos;s reflect on what we did today!
        </h1>

        {/* Question boxes */}
        <div className="flex flex-col gap-6">
          {/* Question 1 */}
          <div className="border border-black rounded-[12px] p-6 relative">
            <div className="flex items-start gap-3 mb-4">
              <p className="text-base font-normal text-black flex-1" style={{ fontSize: '16px', fontWeight: 400 }}>
                {question1}
              </p>
              <button
                onClick={handleSpeakQuestion1}
                className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Read question aloud"
                disabled={isSpeaking}
              >
                <Volume2 className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            
            <div>
              <AudioRecorder
                showTranscript={false}
                buttonText="Press and speak"
                interimResults={true}
                onTranscriptChange={(transcript, isFinal) => {
                  // Update current transcript in real-time
                  setCurrentTranscript1(transcript);
                  // Append final transcript to existing response
                  if (isFinal && transcript) {
                    setResponse1(prev => {
                      // If there's existing text, append with a space, otherwise just use the transcript
                      return prev ? `${prev} ${transcript}` : transcript;
                    });
                    setCurrentTranscript1(''); // Clear interim transcript after saving
                  }
                }}
                onStart={() => {
                  setIsRecording1(true);
                  setCurrentTranscript1(''); // Clear current transcript when starting new recording (but keep existing response)
                }}
                onStop={() => {
                  setIsRecording1(false);
                  // If there's a current transcript when stopping, append it to existing response
                  if (currentTranscript1) {
                    setResponse1(prev => {
                      return prev ? `${prev} ${currentTranscript1}` : currentTranscript1;
                    });
                    setCurrentTranscript1('');
                  }
                }}
                variant="default"
                buttonClassName="bg-black text-white hover:bg-black/90 rounded-xl px-6 py-3 text-sm font-semibold leading-6 !h-auto"
              />
            </div>

            {/* Display response - show existing response + current transcript while speaking */}
            {(currentTranscript1 || response1) && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-700" style={{ fontSize: '16px', fontWeight: 400 }}>
                  {response1}{currentTranscript1 ? ` ${currentTranscript1}` : ''}
                </p>
              </div>
            )}
          </div>

          {/* Question 2 */}
          <div className="border border-black rounded-[12px] p-6 relative">
            <div className="flex items-start gap-3 mb-4">
              <p className="text-base font-normal text-black flex-1" style={{ fontSize: '16px', fontWeight: 400 }}>
                {question2}
              </p>
              <button
                onClick={handleSpeakQuestion2}
                className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Read question aloud"
                disabled={isSpeaking}
              >
                <Volume2 className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            
            <div>
              <AudioRecorder
                showTranscript={false}
                buttonText="Press and speak"
                interimResults={true}
                onTranscriptChange={(transcript, isFinal) => {
                  // Update current transcript in real-time
                  setCurrentTranscript2(transcript);
                  // Append final transcript to existing response
                  if (isFinal && transcript) {
                    setResponse2(prev => {
                      // If there's existing text, append with a space, otherwise just use the transcript
                      return prev ? `${prev} ${transcript}` : transcript;
                    });
                    setCurrentTranscript2(''); // Clear interim transcript after saving
                  }
                }}
                onStart={() => {
                  setIsRecording2(true);
                  setCurrentTranscript2(''); // Clear current transcript when starting new recording (but keep existing response)
                }}
                onStop={() => {
                  setIsRecording2(false);
                  // If there's a current transcript when stopping, append it to existing response
                  if (currentTranscript2) {
                    setResponse2(prev => {
                      return prev ? `${prev} ${currentTranscript2}` : currentTranscript2;
                    });
                    setCurrentTranscript2('');
                  }
                }}
                variant="default"
                buttonClassName="bg-black text-white hover:bg-black/90 rounded-xl px-6 py-3 text-sm font-semibold leading-6 !h-auto"
              />
            </div>

            {/* Display response - show existing response + current transcript while speaking */}
            {(currentTranscript2 || response2) && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-700" style={{ fontSize: '16px', fontWeight: 400 }}>
                  {response2}{currentTranscript2 ? ` ${currentTranscript2}` : ''}
                </p>
              </div>
            )}
          </div>
          
          {/* Complete Button - only show when both responses are added */}
          {hasBothResponses && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleComplete}
                className="bg-black text-white hover:bg-black/90 rounded-xl px-8 py-4 text-base font-semibold"
              >
                Complete
              </Button>
            </div>
          )}
        </div>

        {/* Zhorai character on left side, close to containers */}
        <div className="absolute -left-[220px] top-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <div className="w-[205px] h-[222px] flex-shrink-0">
            <Image
              src="/images/zhorai-character.png"
              alt="Zhorai"
              width={205}
              height={222}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-black/20">
          <div className="relative w-full h-full overflow-hidden">
            {/* Confetti particles */}
            {Array.from({ length: 50 }).map((_, i) => {
              const colors = ['#967FD8', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'];
              const color = colors[i % colors.length];
              const duration = 2 + (i % 3) * 0.5;
              const delay = (i % 10) * 0.1;
              const startX = 40 + (i * 7.2) % 20; // Start from center area
              const startY = 40 + (i % 3) * 5; // Start from upper-middle area
              const endX = startX + ((i % 2 === 0 ? 1 : -1) * (20 + (i % 3) * 10));
              const rotation = i * 14.4;
              
              return (
                <div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    left: `${startX}%`,
                    top: `${startY}%`,
                    backgroundColor: color,
                    animation: `celebrate-${i} ${duration}s ease-out ${delay}s forwards`,
                  }}
                />
              );
            })}
            
            {/* Celebration message */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="bg-white rounded-xl px-8 py-6 shadow-2xl border-2 border-[#967FD8]"
                style={{
                  animation: 'scale-in 0.5s ease-out',
                }}
              >
                <div className="text-center">
                  <div className="text-6xl mb-4 animate-bounce">🎉</div>
                  <h2 className="text-3xl font-bold text-[#967FD8] mb-2">Congratulations!</h2>
                  <p className="text-lg text-gray-700">You&apos;ve completed the activity!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Celebration animation styles */}
      <style dangerouslySetInnerHTML={{__html: `
        ${Array.from({ length: 50 }).map((_, i) => {
          const startX = 40 + (i * 7.2) % 20;
          const endX = startX + ((i % 2 === 0 ? 1 : -1) * (20 + (i % 3) * 10));
          const rotation = i * 14.4;
          const translateX = endX - startX;
          return `
            @keyframes celebrate-${i} {
              0% {
                transform: translate(0, 0) rotate(0deg) scale(1);
                opacity: 1;
              }
              100% {
                transform: translate(${translateX}%, 100vh) rotate(${rotation}deg) scale(0);
                opacity: 0;
              }
            }
          `;
        }).join('')}
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}} />
    </div>
  );
}

export default ReflectionStep;

