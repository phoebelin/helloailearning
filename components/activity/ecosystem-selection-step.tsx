/**
 * Ecosystem Selection Step Component
 * Figma: Desktop-4
 * User selects ecosystem by speaking to Zhorai
 */

'use client';

import React, { useState } from 'react';
import { AudioRecorder } from './audio-recorder';
import { StepComponentProps, EcosystemType } from '@/types/activity';
import { extractEcosystemFromTranscript, cleanTranscript } from '@/lib/utils/speech-utils';

export interface EcosystemSelectionStepProps extends StepComponentProps {
  /** Callback when an ecosystem is selected */
  onEcosystemSelected?: (ecosystem: EcosystemType) => void;
  /** Pre-selected ecosystem (for editing/navigation) */
  selectedEcosystem?: EcosystemType | null;
}

const ecosystemList = ['Desert', 'Ocean', 'Rainforest', 'Grassland', 'Tundra'];

/**
 * Ecosystem Selection Step Component
 * User speaks to select an ecosystem
 */
export function EcosystemSelectionStep({
  onNext,
  onEcosystemSelected,
  selectedEcosystem = null,
}: EcosystemSelectionStepProps) {
  const [selected, setSelected] = useState<EcosystemType | null>(selectedEcosystem);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');

  // Handle transcript from audio recorder
  const handleTranscriptChange = (transcript: string, isFinal: boolean) => {
    // Update the displayed transcript
    setCurrentTranscript(transcript);
    
    if (isFinal && transcript) {
      const cleaned = cleanTranscript(transcript);
      
      // Try to detect ecosystem from speech
      const detected = extractEcosystemFromTranscript(cleaned);
      
      if (detected) {
        setSelected(detected);
        if (onEcosystemSelected) {
          onEcosystemSelected(detected);
        }
        
        // Auto-advance after selection
        setTimeout(() => {
          onNext();
        }, 1500);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 py-20 px-4 max-w-[682px] mx-auto">
      {/* Heading */}
      <h1 className="text-base font-normal leading-[32px] text-black w-full">
        Start by asking Zhorai about your favorite ecosystem.
      </h1>
      
      {/* Ecosystem List */}
      <div className="flex flex-col w-full">
        {ecosystemList.map((ecosystem) => (
          <p key={ecosystem} className="text-base font-normal leading-[32px] text-black">
            {ecosystem}
          </p>
        ))}
      </div>

      {/* Action Section - Button and Example */}
      <div className="flex flex-row items-start gap-6">
        {/* Press and Speak Button using AudioRecorder - Fixed width container */}
        <div className="flex-shrink-0">
          <AudioRecorder
            showTranscript={false}
            buttonText="Press and speak"
            onTranscriptChange={handleTranscriptChange}
            onStart={() => {
              setIsRecording(true);
              setCurrentTranscript('');
            }}
            onStop={() => setIsRecording(false)}
            variant="default"
          />
        </div>
        
        {/* Example Question or Transcript - Maintains position */}
        <div className="flex-1 pt-3">
          {currentTranscript ? (
            <p className="text-sm font-semibold leading-[17px] text-[#967FD8]">
              {currentTranscript}
            </p>
          ) : (
            <p className="text-sm font-semibold leading-[17px] text-[#967FD8] opacity-50">
              "What do you know about the desert?"
            </p>
          )}
        </div>
      </div>

      {/* Selection feedback */}
      {selected && !isRecording && (
        <p className="text-sm text-green-600">
          ✓ {selected} selected! Moving to next step...
        </p>
      )}
    </div>
  );
}
