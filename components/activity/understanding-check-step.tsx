/**
 * Understanding Check Step Component
 * Figma: Desktop-9
 * Tests user's understanding of the mindmap visualization
 */

'use client';

import React, { useState } from 'react';
import { StepComponentProps, EcosystemType } from '@/types/activity';
import { cn } from '@/lib/utils';

export interface UnderstandingCheckStepProps extends StepComponentProps {
  /** The selected ecosystem to show knowledge for */
  ecosystem: EcosystemType;
}

interface CheckboxOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

const checkboxOptions: CheckboxOption[] = [
  {
    id: 'key-words',
    text: 'Zhorai pulled out key words from the sentences.',
    isCorrect: true,
  },
  {
    id: 'color-coding',
    text: 'Zhorai used blue for "lots of" and orange for "little of" something.',
    isCorrect: true,
  },
];

/**
 * Understanding Check Step Component
 */
export function UnderstandingCheckStep({
  ecosystem,
  onNext,
  onPrevious,
}: UnderstandingCheckStepProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleOptionToggle = (optionId: string) => {
    if (hasSubmitted) return; // Prevent changes after submission
    
    setSelectedOptions(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleSubmit = () => {
    setHasSubmitted(true);
    
    // Check if both correct answers are selected
    const isCorrect = selectedOptions.length === 2 && 
      selectedOptions.every(id => checkboxOptions.find(opt => opt.id === id)?.isCorrect);
    
    if (isCorrect) {
      // Auto-advance after correct answer
      setTimeout(() => {
        onNext();
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col gap-6 py-20 px-4 max-w-[682px] mx-auto">
      {/* Main content area */}
      <div className="flex flex-col gap-6 w-full">
        
        {/* Instruction text */}
        <p className="text-base font-normal leading-[32px] text-black w-full">
          Take a look at each circle.
        </p>

        {/* Question and checkbox options */}
        <div className="flex flex-col gap-4 border border-black rounded-xl p-6 w-full">
          <p className="text-base font-normal leading-[32px] text-black w-full">
            What do you notice about the words and colors of each circle?
          </p>
          
          {/* Checkbox Options */}
          <div className="flex flex-col gap-3">
            {checkboxOptions.map((option) => {
              const isSelected = selectedOptions.includes(option.id);
              
              return (
                <button
                  key={option.id}
                  type="button"
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-all text-left',
                    isSelected
                      ? 'bg-[#F4F0FF] border-[#967FD8]'
                      : 'bg-transparent border-transparent'
                  )}
                  onClick={() => handleOptionToggle(option.id)}
                >
                  {/* Checkbox */}
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
                  
                  <span className="text-base font-normal leading-[32px] text-black flex-1">
                    {option.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Submit Button */}
          <div className="flex justify-start mt-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={selectedOptions.length === 0 || hasSubmitted}
              className="bg-black text-white hover:bg-black/90 rounded-xl px-6 py-3 text-sm font-semibold leading-[17px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {hasSubmitted ? 'Submitted' : 'Submit'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
