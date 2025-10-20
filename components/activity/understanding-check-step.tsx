/**
 * Understanding Check Step Component
 * Figma: Desktop-9
 * Tests user's understanding of the mindmap visualization
 */

'use client';

import React, { useState } from 'react';
import { StepComponentProps, EcosystemType, MindmapNode, NodeColor } from '@/types/activity';
import { getEcosystemMindmap } from '@/lib/data/ecosystem-knowledge';
import { cn } from '@/lib/utils';

export interface UnderstandingCheckStepProps extends StepComponentProps {
  /** The selected ecosystem to show knowledge for */
  ecosystem: EcosystemType;
}

/**
 * Get color class for mindmap node based on NodeColor
 */
function getNodeColorClass(color: NodeColor): string {
  switch (color) {
    case 'blue':
      return 'bg-[#2E3F9D]';
    case 'orange':
      return 'bg-[#FD583C]';
    case 'purple':
      return 'bg-[#967FD8]';
    default:
      return 'bg-gray-400';
  }
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
  const [showCelebration, setShowCelebration] = useState(false);

  // Get mindmap data for the selected ecosystem
  const mindmap = getEcosystemMindmap(ecosystem);
  
  // Find one positive (blue) and one negative (orange) example node
  const positiveNode = mindmap.nodes.find(node => node.color === 'blue');
  const negativeNode = mindmap.nodes.find(node => node.color === 'orange');

  const handleOptionToggle = (optionId: string) => {
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
      // Show celebration animation
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
      }, 2000);
    }
  };

  // Check if both correct answers are selected
  const isCorrect = selectedOptions.length === 2 && 
    selectedOptions.every(id => checkboxOptions.find(opt => opt.id === id)?.isCorrect);

  const handleContinue = () => {
    onNext();
  };

  const handleShowExplanation = () => {
    // TODO: Implement explanation functionality
    console.log('Show explanation clicked');
  };

  const handleTryAgain = () => {
    setHasSubmitted(false);
    setSelectedOptions([]);
  };

  return (
    <div className="flex flex-col gap-6 py-20 px-4 max-w-[682px] mx-auto">
      {/* Main content area */}
      <div className="flex flex-col gap-6 w-full">
        
        {/* Instruction text */}
        <p className="text-base font-normal leading-[32px] text-black w-full">
          Take a look at each circle.
        </p>

        {/* Example circles - positive and negative nodes */}
        <div className="flex justify-center gap-6 py-3">
          {positiveNode && (
            <div className="flex flex-col items-center">
              <div className={cn(
                'w-[103px] h-[59px] rounded-full flex items-center justify-center',
                getNodeColorClass(positiveNode.color)
              )}>
                <span className="text-base font-semibold text-white text-center px-2">
                  {positiveNode.label}
                </span>
              </div>
            </div>
          )}
          {negativeNode && (
            <div className="flex flex-col items-center">
              <div className={cn(
                'w-[103px] h-[59px] rounded-full flex items-center justify-center',
                getNodeColorClass(negativeNode.color)
              )}>
                <span className="text-base font-semibold text-white text-center px-2">
                  {negativeNode.label}
                </span>
              </div>
            </div>
          )}
        </div>

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

          {/* Celebration Animation */}
          {showCelebration && (
            <div className="flex justify-center items-center py-4">
              <div className="flex items-center gap-2 animate-bounce">
                <span className="text-2xl">🎉</span>
                <span className="text-lg font-semibold text-green-600">Great job!</span>
                <span className="text-2xl">🎉</span>
              </div>
            </div>
          )}

          {/* Submit Button or CTAs */}
          <div className="flex justify-start mt-2">
            {hasSubmitted && isCorrect ? (
              /* CTAs - Replace submit button when correct */
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleContinue}
                  className="bg-black text-white hover:bg-black/90 rounded-xl px-6 py-3 text-sm font-semibold leading-[17px] cursor-pointer"
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={handleShowExplanation}
                  className="border border-black text-black bg-white hover:bg-gray-50 rounded-xl px-6 py-3 text-sm font-semibold leading-[17px] cursor-pointer"
                >
                  Show explanation
                </button>
              </div>
            ) : hasSubmitted && !isCorrect ? (
              /* Try Again and Show Explanation when incorrect */
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleTryAgain}
                  className="bg-black text-white hover:bg-black/90 rounded-xl px-6 py-3 text-sm font-semibold leading-[17px] cursor-pointer"
                >
                  Try again
                </button>
                <button
                  type="button"
                  onClick={handleShowExplanation}
                  className="border border-black text-black bg-white hover:bg-gray-50 rounded-xl px-6 py-3 text-sm font-semibold leading-[17px] cursor-pointer"
                >
                  Show explanation
                </button>
              </div>
            ) : (
              /* Check Button */
              <button
                type="button"
                onClick={handleSubmit}
                disabled={selectedOptions.length === 0}
                className="bg-black text-white hover:bg-black/90 rounded-xl px-6 py-3 text-sm font-semibold leading-[17px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Check
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
