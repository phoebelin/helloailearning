/**
 * Animal Selection Step Component
 * Figma: Desktop-11
 * User selects an animal to teach Zhorai about
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { StepComponentProps } from '@/types/activity';
import { cn } from '@/lib/utils';
import { useEnhancedTextToSpeech } from '@/hooks/use-enhanced-text-to-speech';

export interface AnimalSelectionStepProps extends StepComponentProps {
  /** Callback when an animal is selected */
  onAnimalSelected?: (animal: AnimalType) => void;
  /** Pre-selected animal (for editing/navigation) */
  selectedAnimal?: AnimalType | null;
}

type AnimalType = 'bees' | 'dolphins' | 'monkeys' | 'zebras';

interface AnimalOption {
  id: AnimalType;
  name: string;
  icon: string;
}

const animalOptions: AnimalOption[] = [
  {
    id: 'bees',
    name: 'Bees',
    icon: '🐝',
  },
  {
    id: 'dolphins',
    name: 'Dolphins',
    icon: '🐬',
  },
  {
    id: 'monkeys',
    name: 'Monkeys',
    icon: '🐒',
  },
  {
    id: 'zebras',
    name: 'Zebras',
    icon: '🦓',
  },
];

/**
 * Zhorai character from Figma asset
 */
function ZhoraiCharacter({ className }: { className?: string }) {
  return (
    <img
      src="/images/zhorai-character.png"
      alt="Zhorai"
      className={cn('w-full h-full object-contain', className)}
    />
  );
}

/**
 * Animal Selection Step Component
 */
export function AnimalSelectionStep({
  onNext,
  onAnimalSelected,
  selectedAnimal = null,
}: AnimalSelectionStepProps) {
  const [selected, setSelected] = useState<AnimalType | null>(selectedAnimal);
  const { speak } = useEnhancedTextToSpeech({
    rate: 0.9, // Slightly slower for child comprehension
    pitch: 1.1, // Slightly higher pitch for friendly tone
    useGoogleCloud: true, // Prefer Google Cloud TTS for better Chrome compatibility
  });
  const previousSelectedRef = useRef<AnimalType | null>(null);

  const handleAnimalSelect = (animal: AnimalType) => {
    setSelected(animal);
    if (onAnimalSelected) {
      onAnimalSelected(animal);
    }
  };

  // Speak the speech bubble text when an animal is selected
  useEffect(() => {
    if (selected && selected !== previousSelectedRef.current) {
      const animalName = animalOptions.find(a => a.id === selected)?.name.toLowerCase();
      const speechText = `Yay! Can you teach me about ${animalName}?`;
      
      // Add a small delay to prevent rapid successive calls
      const timeoutId = setTimeout(() => {
        speak(speechText, {
          onError: (error) => {
            // Only log non-canceled errors to avoid console spam
            if (error !== 'canceled') {
              console.warn('Speech synthesis error:', error);
            }
          }
        });
      }, 100);
      
      previousSelectedRef.current = selected;
      
      // Cleanup timeout on unmount or dependency change
      return () => clearTimeout(timeoutId);
    }
  }, [selected]);

  const handleContinue = () => {
    if (selected) {
      onNext();
    }
  };

  return (
    <div className="max-w-[682px] mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Context Text */}
        <div className="text-left">
          <p className="text-base leading-8 text-black">
            Zhorai knows a lot about ecosystems, but hasn't met any animals before! Can you teach it about some animals?
          </p>
        </div>

        {/* Question Box */}
        <div className="bg-white border border-black rounded-xl p-6">
          <p className="text-base leading-8 text-black mb-4">
            Choose an animal to teach Zhorai about!
          </p>

          {/* Animal Selection Area with Zhorai */}
          <div className="flex justify-between items-stretch gap-40">
            {/* Animal Options */}
            <div className="flex flex-col gap-3 flex-1">
              {animalOptions.map((animal) => {
                const isSelected = selected === animal.id;
                
                return (
                  <button
                    key={animal.id}
                    type="button"
                    onClick={() => handleAnimalSelect(animal.id)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-all text-left w-full',
                      isSelected
                        ? 'bg-[#F4F0FF] border-[#967FD8]'
                        : 'bg-transparent border-transparent'
                    )}
                    aria-pressed={isSelected}
                    aria-checked={isSelected}
                    role="checkbox"
                  >
                    <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                      {isSelected ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="3" width="18" height="18" rx="2" fill="#967FD8"/>
                          <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" stroke="black" strokeWidth="1"/>
                        </svg>
                      )}
                    </div>
                    
                    <span className="text-base font-normal leading-8 text-black flex-1">
                      {animal.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Zhorai Character */}
            <div className="w-[205px] h-[222px] flex-shrink-0">
              <ZhoraiCharacter />
            </div>
          </div>

          {/* Continue Button and Speech Bubble */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleContinue}
                disabled={!selected}
                className="bg-black text-white hover:bg-black/90 rounded-xl px-6 py-3 text-sm font-semibold leading-[17px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
            {selected && (
              <p className="text-sm font-semibold leading-[17px] text-[#967FD8]">
                "Yay! Can you teach me about {animalOptions.find(a => a.id === selected)?.name.toLowerCase()}?"
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
