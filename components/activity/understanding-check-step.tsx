/**
 * Understanding Check Step Component
 * Figma: Desktop-9
 * Tests user's understanding of the mindmap visualization
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { StepComponentProps, EcosystemType, MindmapNode, NodeColor } from '@/types/activity';
import { getEcosystemMindmap } from '@/lib/data/ecosystem-knowledge';
import { useActivity } from '@/lib/context/activity-context';
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
      return 'bg-blue-500 border-blue-600 text-white';
    case 'orange':
      return 'bg-orange-500 border-orange-600 text-white';
    case 'purple':
      return 'bg-[#967fd8] border-[#967fd8] text-white';
    case 'neutral':
      return 'bg-gray-400 border-gray-500 text-white';
    default:
      return 'bg-gray-400 border-gray-500 text-white';
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
  const { state, setCheckAnswers } = useActivity();
  const [selectedOptions, setSelectedOptions] = useState<string[]>(state.checkAnswers || []);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // Check if step is already completed (from persisted state)
  const isCompleted = state.checkAnswers.length === 2;
  // Only show bottom nav when actually on the understanding-check step
  const isOnUnderstandingCheckStep = state.currentStep === 'understanding-check';
  const hasInitialized = useRef(false);
  
  // Initialize selectedOptions from persisted checkAnswers on mount
  useEffect(() => {
    if (!hasInitialized.current && state.checkAnswers.length > 0) {
      setSelectedOptions(state.checkAnswers);
      // If we have 2 answers, mark as submitted and correct
      if (state.checkAnswers.length === 2) {
        setHasSubmitted(true);
        setIsCorrect(true);
      }
      hasInitialized.current = true;
    }
  }, [state.checkAnswers]);

  // Get mindmap data for the selected ecosystem
  const mindmap = getEcosystemMindmap(ecosystem);
  
  // Find one positive (blue) and one negative (orange) example node
  const positiveNode = mindmap?.nodes?.find(node => node.color === 'blue');
  const negativeNode = mindmap?.nodes?.find(node => node.color === 'orange');

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
    const correct = selectedOptions.length === 2 && 
      selectedOptions.every(id => checkboxOptions.find(opt => opt.id === id)?.isCorrect);
    
    setIsCorrect(correct);
    
    // Save answers to context (persisted state)
    if (correct) {
      setCheckAnswers(selectedOptions);
      // Show celebration animation
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
      }, 2000);
    }
  };

  const handleContinue = () => {
    // Small delay to ensure the bottom nav disappears first, then advance to next step
    setTimeout(() => {
      onNext();
    }, 150); // Slightly longer delay to ensure smooth transition
  };

  const handleShowExplanation = () => {
    setShowExplanation(!showExplanation);
  };


  const handleTryAgain = () => {
    setHasSubmitted(false);
    setSelectedOptions([]);
    setIsCorrect(false);
    setShowExplanation(false);
  };

  const handleShowAnswer = () => {
    // Select both correct answers
    const correctAnswers = checkboxOptions.filter(option => option.isCorrect);
    setSelectedOptions(correctAnswers.map(option => option.id));
    setIsCorrect(true);
    setShowExplanation(true);
    setHasSubmitted(true);
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="flex flex-col gap-6 py-20 px-4 max-w-[682px] mx-auto min-h-screen pb-24">
        {/* Main content area */}
        <div className="flex flex-col gap-6 w-full flex-1">
          
          {/* Instruction text */}
          <p className="text-base font-normal leading-[32px] text-black w-full">
            Take a look at each circle.
          </p>

          {/* Example circles - positive and negative nodes */}
          <div className="flex justify-center gap-6 py-3">
            {positiveNode && (
              <div className="flex flex-col items-center">
                <div className={cn(
                  'w-20 h-20 rounded-full border-2 flex items-center justify-center',
                  'font-medium shadow-sm',
                  getNodeColorClass(positiveNode.color)
                )}>
                  <span className="text-sm text-white text-center px-1 leading-tight">
                    {positiveNode.label}
                  </span>
                </div>
              </div>
            )}
            {negativeNode && (
              <div className="flex flex-col items-center">
                <div className={cn(
                  'w-20 h-20 rounded-full border-2 flex items-center justify-center',
                  'font-medium shadow-sm',
                  getNodeColorClass(negativeNode.color)
                )}>
                  <span className="text-sm text-white text-center px-1 leading-tight">
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
                    onClick={() => handleOptionToggle(option.id)}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-all text-left w-full',
        isSelected
          ? hasSubmitted && !isCorrect
            ? 'bg-yellow-100 border-yellow-400'
            : 'bg-[#F4F0FF] border-[#967FD8]'
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
                    
                    <span className="text-base font-normal leading-[32px] text-black flex-1">
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Inline Explanation Text */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
              showExplanation ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
            }`}>
              <p className="text-base font-medium text-[#967FD8] leading-6">
                Zhorai learned about each ecosystem through many sentences. Then Zhorai encoded each idea into a mindmap with key words and positive and negative colors.
              </p>
            </div>

          </div>
        </div>

        {/* Bottom Navigation Pattern - Only show when user is actively working on this step */}
        {!isCompleted && isOnUnderstandingCheckStep ? (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-6">
            <div className="max-w-[682px] mx-auto flex justify-center items-center">
              {/* Centered content */}
              <div className="flex items-center gap-8">
                {/* Success/Error message */}
                {hasSubmitted && isCorrect && (
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎉</span>
                    <span className="text-base font-semibold text-[#967FD8]">That's right!</span>
                  </div>
                )}
                {hasSubmitted && !isCorrect && (
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-[#967FD8]">💪 Hey, that's okay!</span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                  {hasSubmitted && isCorrect ? (
                    <>
                      <button
                        type="button"
                        onClick={handleContinue}
                        className="bg-black text-white hover:bg-black/90 rounded-xl px-6 py-4 text-base font-semibold leading-[17px] cursor-pointer"
                      >
                        Continue
                      </button>
                      <button
                        type="button"
                        onClick={handleShowExplanation}
                        className="border border-black text-black bg-white hover:bg-gray-50 rounded-xl px-6 py-4 text-base font-semibold leading-[17px] cursor-pointer"
                      >
                        Why?
                      </button>
                    </>
                ) : hasSubmitted && !isCorrect ? (
                  <>
                    <button
                      type="button"
                      onClick={handleTryAgain}
                      className="bg-black text-white hover:bg-black/90 rounded-xl px-6 py-4 text-base font-semibold leading-[17px] cursor-pointer"
                    >
                      Try again
                    </button>
                    <button
                      type="button"
                      onClick={handleShowAnswer}
                      className="border border-black text-black bg-white hover:bg-gray-50 rounded-xl px-6 py-4 text-base font-semibold leading-[17px] cursor-pointer"
                    >
                      Show answer
                    </button>
                  </>
                ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={selectedOptions.length === 0}
                      className="bg-black text-white hover:bg-black/90 rounded-xl px-12 py-4 text-base font-semibold leading-[17px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Check
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

    </form>
  );
}
