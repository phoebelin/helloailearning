/**
 * Animal Selection Step Component
 * Figma: Desktop-11
 * User selects an animal to teach Zhorai about
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StepComponentProps } from '@/types/activity';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

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
 * Zhorai character SVG component
 */
function ZhoraiCharacter({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-full h-full', className)}
      aria-label="Zhorai"
    >
      {/* Robot head */}
      <circle cx="100" cy="100" r="60" fill="#967FD8" />
      
      {/* Eyes */}
      <circle cx="85" cy="90" r="8" fill="white" />
      <circle cx="115" cy="90" r="8" fill="white" />
      <circle cx="87" cy="90" r="4" fill="#1a1a1a" />
      <circle cx="117" cy="90" r="4" fill="#1a1a1a" />
      
      {/* Happy smile */}
      <path
        d="M 75 110 Q 100 125 125 110"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Antenna */}
      <line x1="100" y1="40" x2="100" y2="25" stroke="#967FD8" strokeWidth="3" />
      <circle cx="100" cy="20" r="5" fill="#FFB84D" />
      
      {/* Robot body (simplified) */}
      <rect x="70" y="155" width="60" height="40" rx="5" fill="#967FD8" opacity="0.7" />
      
      {/* Arms */}
      <rect x="50" y="165" width="15" height="20" rx="3" fill="#967FD8" opacity="0.6" />
      <rect x="135" y="165" width="15" height="20" rx="3" fill="#967FD8" opacity="0.6" />
    </svg>
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

  const handleAnimalSelect = (animal: AnimalType) => {
    setSelected(animal);
    if (onAnimalSelected) {
      onAnimalSelected(animal);
    }
  };

  const handleContinue = () => {
    if (selected) {
      onNext();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="space-y-8">
        {/* Context Text */}
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            Zhorai knows a lot about ecosystems, but hasn't met any animals before! Can you teach it about some animals?
          </p>
        </div>

        {/* Question Box */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center">
            <p className="text-xl font-semibold">
              Choose an animal to teach Zhorai about!
            </p>
          </div>
        </div>

        {/* Animal Selection Area with Zhorai */}
        <div className="relative">
          {/* Zhorai Character */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-24 h-24 md:w-32 md:h-32">
              <ZhoraiCharacter />
            </div>
          </div>

          {/* Radio Button Options */}
          <div className="max-w-2xl mx-auto grid grid-cols-2 gap-4">
            {animalOptions.map((animal) => {
              const isSelected = selected === animal.id;
              
              return (
                <label
                  key={animal.id}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
                    'hover:shadow-md',
                    isSelected
                      ? 'border-[#967FD8] bg-[#F4F0FF]'
                      : 'border-gray-200 bg-white'
                  )}
                  onClick={() => handleAnimalSelect(animal.id)}
                >
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                      isSelected
                        ? 'border-[#967FD8] bg-[#F4F0FF]'
                        : 'border-gray-300 bg-white'
                    )}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-[#967FD8]" />
                    )}
                  </div>
                  
                  <span className="text-2xl">{animal.icon}</span>
                  <span className="text-lg font-medium flex-1">{animal.name}</span>
                  
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[#967FD8] flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* Dynamic Speech Bubble */}
        {selected && (
          <div className="flex justify-center">
            <div className="relative bg-white border-2 border-gray-200 rounded-lg p-4 max-w-md">
              <p className="text-lg font-medium text-[#967FD8] text-center">
                Can you teach me about {animalOptions.find(a => a.id === selected)?.name}?
              </p>
              
              {/* Speech bubble tail */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <div className="w-4 h-4 bg-white border-r-2 border-b-2 border-gray-200 transform rotate-45" />
              </div>
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!selected}
            className="min-w-[180px] bg-black text-white hover:bg-black/90 disabled:opacity-50"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
