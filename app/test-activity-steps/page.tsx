/**
 * TEMPORARY TEST PAGE - DELETE BEFORE PRODUCTION
 * Manual testing page for all activity step components
 * Single-page scrollable experience
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { IntroductionStep } from '@/components/activity/introduction-step';
import { EcosystemSelectionStep } from '@/components/activity/ecosystem-selection-step';
import { KnowledgeVisualizationStep } from '@/components/activity/knowledge-visualization-step';
import { UnderstandingCheckStep } from '@/components/activity/understanding-check-step';
import { AnimalSelectionStep } from '@/components/activity/animal-selection-step';
import { SentenceInputStep } from '@/components/activity/sentence-input-step';
import { PredictionStep } from '@/components/activity/prediction-step';
import { ReflectionStep } from '@/components/activity/reflection-step';
import { ActivityProvider, useActivity } from '@/lib/context/activity-context';
import { EcosystemType, Sentence } from '@/types/activity';
import { exposeDebugFunctions, testConceptExtraction, testSentimentExamples, testMindmapGeneration } from '@/lib/utils/debug-sentences';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type AnimalType = 'bees' | 'dolphins' | 'monkeys' | 'zebras';

// Map ActivityStep to page step index
const stepToIndexMap: Record<string, number> = {
  'introduction': 0,
  'ecosystem-selection': 1,
  'knowledge-visualization': 2,
  'understanding-check': 3,
  'animal-selection': 4,
  'sentence-input': 5,
  'sentence-list': 5, // Same as sentence-input
  'mindmap-display': 5, // Same as sentence-input
  'prediction': 6,
  'reflection': 7,
  'completion': 7, // Same as reflection
};

const indexToStepMap: Record<number, string> = {
  0: 'introduction',
  1: 'ecosystem-selection',
  2: 'knowledge-visualization',
  3: 'understanding-check',
  4: 'animal-selection',
  5: 'sentence-input',
  6: 'prediction',
  7: 'reflection',
};

function DebugInfo({ 
  currentStep, 
  maxStepReached,
  selectedEcosystem, 
  selectedAnimal,
  sentences
}: { 
  currentStep: number; 
  maxStepReached: number;
  selectedEcosystem: EcosystemType | null; 
  selectedAnimal: AnimalType | null;
  sentences: Sentence[];
}) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // Expose debug functions to window for console access
    exposeDebugFunctions();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs">
      <details className="bg-white border rounded-lg shadow-lg p-4">
        <summary className="font-medium cursor-pointer text-sm">Debug Info</summary>
        <div className="mt-2 text-xs space-y-1">
          <p><strong>Current Step:</strong> {currentStep + 1}</p>
          <p><strong>Max Step Reached:</strong> {maxStepReached + 1}</p>
          <p><strong>Steps Revealed:</strong> {maxStepReached + 1} of 8</p>
          <p><strong>Ecosystem:</strong> {selectedEcosystem || 'None'}</p>
          <p><strong>Animal:</strong> {selectedAnimal || 'None'}</p>
          <p><strong>Sentences:</strong> {sentences?.length || 0}</p>
          {sentences.length > 0 && (
            <div className="mt-2">
              <p><strong>Sentence Details:</strong></p>
              <ul className="ml-2 text-xs max-h-32 overflow-y-auto">
                {sentences.map((sentence, index) => (
                  <li key={sentence.id} className="mb-1">
                    {index + 1}. {sentence.sentence}
                    {sentence.concepts.length > 0 && (
                      <span className="text-gray-500">
                        {' '}({sentence.concepts.length} concepts)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              
              {/* Detailed Concepts Display */}
              <div className="mt-3">
                <p><strong>Detailed Concepts:</strong></p>
                <div className="ml-2 text-xs max-h-40 overflow-y-auto space-y-2">
                  {sentences.map((sentence, index) => (
                    <div key={sentence.id} className="border-l-2 border-gray-200 pl-2">
                      <p className="font-medium text-gray-700">Sentence {index + 1}:</p>
                      <p className="text-gray-600 mb-1">&quot;{sentence.sentence}&quot;</p>
                      <p className="text-gray-500 mb-1">ID: {sentence.id}</p>
                      <p className="text-gray-500 mb-1">Animal: {sentence.animalId}</p>
                      <p className="text-gray-500 mb-1">Timestamp: {new Date(sentence.timestamp).toLocaleString()}</p>
                      {sentence.concepts.length > 0 ? (
                        <div>
                          <p className="text-gray-500 mb-1">Concepts ({sentence.concepts.length}):</p>
                          <ul className="ml-2 space-y-1">
                            {sentence.concepts.map((concept, conceptIndex) => (
                              <li key={conceptIndex} className="text-gray-600">
                                • <span className="font-medium">{concept.word}</span> 
                                <span className="text-gray-400">({concept.type}, {concept.abundance}, {concept.color})</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-gray-400 italic">No concepts extracted</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Console Log Button */}
              <div className="mt-3 flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    console.log('=== CURRENT STORED SENTENCES AND CONCEPTS ===');
                    console.log('Total sentences:', sentences.length);
                    sentences.forEach((sentence, index) => {
                      console.log(`\nSentence ${index + 1}:`, {
                        id: sentence.id,
                        sentence: sentence.sentence,
                        animalId: sentence.animalId,
                        timestamp: new Date(sentence.timestamp).toLocaleString(),
                        concepts: sentence.concepts,
                        conceptCount: sentence.concepts.length
                      });
                    });
                    console.log('=== END SENTENCES DATA ===');
                  }}
                  className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                >
                  Log to Console
                </button>
                
                <button
                  onClick={() => {
                    testConceptExtraction('Bees live in trees and make honey', 'bees');
                  }}
                  className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                >
                  Test Extraction
                </button>
                
                <button
                  onClick={() => {
                    testSentimentExamples();
                  }}
                  className="px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors"
                >
                  Test Sentiment
                </button>
                
                <button
                  onClick={() => {
                    testMindmapGeneration();
                  }}
                  className="px-3 py-1 bg-indigo-500 text-white text-xs rounded hover:bg-indigo-600 transition-colors"
                >
                  Test Mindmap
                </button>
              </div>
            </div>
          )}
          {mounted && (
            <>
              <p className="mt-2"><strong>Browser Support:</strong></p>
              <ul className="ml-2 text-xs">
                <li>Speech: {'SpeechRecognition' in window || 'webkitSpeechRecognition' in window ? '✅' : '❌'}</li>
              </ul>
            </>
          )}
        </div>
      </details>
    </div>
  );
}

function TestActivityStepsContent() {
  const {
    state,
    nextStep: contextNextStep,
    previousStep: contextPreviousStep,
    goToStep,
    selectEcosystem,
    selectAnimal,
    addSentence,
    editSentence,
    deleteSentence,
    updateSentenceConcepts,
  } = useActivity();

  // Convert context step to page step index
  // Use state.stepIndex from context, but map it to our page step index
  const contextStepIndex = state.stepIndex;
  const currentStepIndex = stepToIndexMap[state.currentStep] ?? contextStepIndex;
  
  const [maxStepReached, setMaxStepReached] = useState(currentStepIndex);
  const [visibleStepIndex, setVisibleStepIndex] = useState(currentStepIndex);

  // Sync maxStepReached with current step
  useEffect(() => {
    setMaxStepReached(prev => Math.max(prev, currentStepIndex));
  }, [currentStepIndex]);

  // Sync visibleStepIndex with currentStepIndex immediately on navigation
  // This prevents flashing when navigating between steps
  useEffect(() => {
    // Only update if we're not in the middle of programmatic navigation
    // This prevents race conditions with Intersection Observer
    if (!isNavigatingProgrammaticallyRef.current) {
      setVisibleStepIndex(currentStepIndex);
    } else {
      // If we are navigating programmatically, update immediately
      setVisibleStepIndex(currentStepIndex);
      // Reset the flag after a short delay to allow Intersection Observer to work for manual scrolling
      setTimeout(() => {
        isNavigatingProgrammaticallyRef.current = false;
      }, 500);
    }
  }, [currentStepIndex]);

  // Refs for each step to enable auto-scrolling
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const step0Ref = useRef<HTMLDivElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const step4Ref = useRef<HTMLDivElement>(null);
  const step5Ref = useRef<HTMLDivElement>(null);
  const step6Ref = useRef<HTMLDivElement>(null);
  const step7Ref = useRef<HTMLDivElement>(null);

  const stepRefs = [step0Ref, step1Ref, step2Ref, step3Ref, step4Ref, step5Ref, step6Ref, step7Ref];

  // Track if user is manually scrolling to prevent auto-scroll interference
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isNavigatingProgrammaticallyRef = useRef(false);

  // Only auto-scroll when step changes programmatically (via buttons), not during manual scrolling
  useEffect(() => {
    // Don't auto-scroll if user is currently scrolling
    if (isUserScrollingRef.current) return;
    
    // Only auto-scroll if we're navigating programmatically
    if (!isNavigatingProgrammaticallyRef.current) return;
    
    const stepRef = stepRefs[currentStepIndex]?.current;
    if (stepRef) {
      // Use a small delay to ensure DOM is updated and step is rendered
      const timeoutId = setTimeout(() => {
        if (!isUserScrollingRef.current && stepRefs[currentStepIndex]?.current) {
          stepRefs[currentStepIndex].current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 50);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentStepIndex, stepRefs]);

  // Detect manual scrolling
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      isUserScrollingRef.current = true;
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Reset flag after scrolling stops
      scrollTimeoutRef.current = setTimeout(() => {
        isUserScrollingRef.current = false;
      }, 150);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Track which step is currently visible in viewport using Intersection Observer
  // Only update during manual scrolling, not during programmatic navigation
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    
    stepRefs.forEach((ref, index) => {
      if (!ref.current) return;
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
              // Only update if user is manually scrolling AND not navigating programmatically
              // This prevents flashing during button navigation
              if (isUserScrollingRef.current && !isNavigatingProgrammaticallyRef.current) {
                setVisibleStepIndex(index);
              }
            }
          });
        },
        {
          threshold: [0, 0.5, 1],
          rootMargin: '-20% 0px -20% 0px', // Only trigger when step is in center 60% of viewport
        }
      );
      
      observer.observe(ref.current);
      observers.push(observer);
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, [stepRefs, maxStepReached]);

  const handleNext = (stepIndex: number) => {
    if (stepIndex < 7) {
      const nextStepIndex = stepIndex + 1;
      const nextStep = indexToStepMap[nextStepIndex];
      if (nextStep) {
        goToStep(nextStep as any);
      }
      setMaxStepReached(prev => Math.max(prev, nextStepIndex));
    }
  };

  // Sync sentences from context
  const sentences = state.userSentences;
  const selectedEcosystem = state.selectedEcosystem;
  const selectedAnimal = state.selectedAnimal as AnimalType | null;

  const handleEcosystemSelected = (ecosystem: EcosystemType) => {
    selectEcosystem(ecosystem);
  };

  const handleAnimalSelected = (animal: AnimalType) => {
    selectAnimal(animal);
  };

  const handleSentencesUpdate = (newSentences: Sentence[]) => {
    // Sync sentences array with context
    // Compare current context sentences with new sentences
    const currentSentences = state.userSentences;
    
    // Find sentences to add (in newSentences but not in currentSentences by ID or text)
    newSentences.forEach(newSentence => {
      const existsById = currentSentences.some(s => s.id === newSentence.id);
      const existsByText = currentSentences.some(s => 
        s.sentence.toLowerCase().trim() === newSentence.sentence.toLowerCase().trim()
      );
      
      if (!existsById && !existsByText) {
        // Add new sentence via context
        addSentence(newSentence.sentence);
        // After adding, update concepts if they were extracted
        // Note: concepts will be updated in the next render cycle
        setTimeout(() => {
          const addedSentence = state.userSentences.find(s => 
            s.sentence.toLowerCase().trim() === newSentence.sentence.toLowerCase().trim() &&
            s.id !== newSentence.id
          );
          if (addedSentence && newSentence.concepts.length > 0) {
            updateSentenceConcepts(addedSentence.id, newSentence.concepts);
          }
        }, 0);
      } else if (existsById) {
        // Check if sentence was edited
        const currentSentence = currentSentences.find(s => s.id === newSentence.id);
        if (currentSentence && currentSentence.sentence !== newSentence.sentence) {
          // Edit sentence via context
          editSentence(newSentence.id, newSentence.sentence);
        }
        // Update concepts if they changed
        if (currentSentence && JSON.stringify(currentSentence.concepts) !== JSON.stringify(newSentence.concepts)) {
          updateSentenceConcepts(newSentence.id, newSentence.concepts);
        }
      }
    });
    
    // Find sentences to delete (in currentSentences but not in newSentences)
    currentSentences.forEach(currentSentence => {
      const stillExists = newSentences.some(s => 
        s.id === currentSentence.id || 
        s.sentence.toLowerCase().trim() === currentSentence.sentence.toLowerCase().trim()
      );
      if (!stillExists) {
        // Delete sentence via context
        deleteSentence(currentSentence.id);
      }
    });
  };

  // Total number of steps (introduction through reflection, excluding completion)
  const totalSteps = 8; // indices 0-7 (removed last 2 rectangles)

  // Navigation handlers for header buttons
  // We need to navigate based on the page's step mapping, not the context's step sequence
  const handleHeaderPrevious = useCallback(() => {
    // Calculate currentStepIndex fresh to ensure we have the latest value
    const calculatedIndex = stepToIndexMap[state.currentStep] ?? state.stepIndex;
    
    if (calculatedIndex <= 0) return;
    
    // Find the previous step in our page mapping
    const prevIndex = calculatedIndex - 1;
    const prevStepName = indexToStepMap[prevIndex];
    
    if (!prevStepName) return;
    
    // Mark that we're navigating programmatically
    isNavigatingProgrammaticallyRef.current = true;
    
    // Update visibleStepIndex immediately to prevent flashing
    setVisibleStepIndex(prevIndex);
    
    // Navigate to the previous step
    goToStep(prevStepName as any);
    
    // Ensure scroll happens after state update
    setTimeout(() => {
      const stepRef = stepRefs[prevIndex]?.current;
      if (stepRef) {
        stepRef.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  }, [goToStep, state.currentStep, state.stepIndex, stepRefs]);

  const handleHeaderNext = useCallback(() => {
    // Calculate currentStepIndex fresh to ensure we have the latest value
    const calculatedIndex = stepToIndexMap[state.currentStep] ?? state.stepIndex;
    
    if (calculatedIndex >= totalSteps - 1) return;
    
    const nextIndex = calculatedIndex + 1;
    const nextStep = indexToStepMap[nextIndex];
    
    if (!nextStep) return;
    
    // Mark that we're navigating programmatically
    isNavigatingProgrammaticallyRef.current = true;
    
    // Update visibleStepIndex immediately to prevent flashing
    setVisibleStepIndex(nextIndex);
    
    // Navigate to the next step
    goToStep(nextStep as any);
    setMaxStepReached(prev => Math.max(prev, nextIndex));
    
    // Ensure scroll happens after state update
    setTimeout(() => {
      const stepRef = stepRefs[nextIndex]?.current;
      if (stepRef) {
        stepRef.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  }, [goToStep, state.currentStep, state.stepIndex, totalSteps, stepRefs]);

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Header - shows progress */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b z-40 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-[60px] py-6">
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHeaderPrevious}
              disabled={currentStepIndex === 0}
              className="text-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            {/* Progress indicators - rectangular bars matching Figma design */}
            <div className="flex items-center" style={{ width: '432px', gap: '8px' }}>
              {Array.from({ length: totalSteps }).map((_, index) => {
                const isCompleted = index <= visibleStepIndex;
                return (
                  <div
                    key={index}
                    className="h-3 transition-colors"
                    style={{
                      flex: 1,
                      backgroundColor: isCompleted ? '#967FD8' : '#D9D9D9',
                      borderRadius: '12px',
                    }}
                  />
                );
              })}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHeaderNext}
              disabled={currentStepIndex >= totalSteps - 1}
              className="text-sm"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content with Snap Scrolling */}
      <div 
        ref={scrollContainerRef} 
        className="overflow-y-auto h-screen"
        style={{ 
          scrollSnapType: 'y mandatory',
        }}
      >
        <div className="pt-20 pb-20">
      {/* Step 0: Introduction */}
      {currentStepIndex >= 0 && (
        <div ref={step0Ref} className="min-h-screen flex items-center justify-center py-12" style={{ scrollSnapAlign: 'start', scrollMarginTop: '80px' }}>
          <IntroductionStep
            onNext={() => handleNext(0)}
            onPrevious={() => {}}
          />
        </div>
      )}

      {/* Step 1: Ecosystem Selection */}
      {currentStepIndex >= 1 && (
        <div ref={step1Ref} data-step="ecosystem-selection" className="min-h-screen flex items-center justify-center py-12" style={{ scrollSnapAlign: 'start', scrollMarginTop: '80px' }}>
          <EcosystemSelectionStep
            onNext={() => handleNext(1)}
            onPrevious={() => goToStep('introduction')}
            onEcosystemSelected={handleEcosystemSelected}
            selectedEcosystem={selectedEcosystem}
          />
        </div>
      )}

      {/* Step 2: Knowledge Visualization */}
      {maxStepReached >= 2 && selectedEcosystem && (
        <div ref={step2Ref} data-step="knowledge-visualization" className="min-h-screen flex items-center justify-center py-12" style={{ scrollSnapAlign: 'start', scrollMarginTop: '80px' }}>
          <KnowledgeVisualizationStep
            ecosystem={selectedEcosystem}
            onNext={() => handleNext(2)}
            onPrevious={() => goToStep('ecosystem-selection')}
            onChangeEcosystem={() => goToStep('ecosystem-selection')}
          />
        </div>
      )}

      {/* Step 3: Understanding Check */}
      {maxStepReached >= 3 && selectedEcosystem && (
        <div ref={step3Ref} className="min-h-screen flex items-center justify-center py-12" style={{ scrollSnapAlign: 'start', scrollMarginTop: '80px' }}>
          <UnderstandingCheckStep
            ecosystem={selectedEcosystem}
            onNext={() => handleNext(3)}
            onPrevious={() => goToStep('knowledge-visualization')}
          />
        </div>
      )}

      {/* Step 4: Animal Selection */}
      {maxStepReached >= 4 && (
        <div ref={step4Ref} className="min-h-screen flex items-center justify-center py-12" style={{ scrollSnapAlign: 'start', scrollMarginTop: '80px' }}>
          <AnimalSelectionStep
            onNext={() => handleNext(4)}
            onPrevious={() => goToStep('understanding-check')}
            onAnimalSelected={handleAnimalSelected}
            selectedAnimal={selectedAnimal}
          />
        </div>
      )}

      {/* Step 5: Sentence Input */}
      {maxStepReached >= 5 && selectedAnimal && (
        <div ref={step5Ref} className="min-h-screen flex items-center justify-center py-12" style={{ scrollSnapAlign: 'start', scrollMarginTop: '80px' }}>
          <SentenceInputStep
            animal={selectedAnimal}
            sentences={sentences}
            onSentencesUpdate={handleSentencesUpdate}
            onNext={() => handleNext(5)}
            onPrevious={() => goToStep('animal-selection')}
          />
        </div>
      )}

      {/* Step 6: Prediction */}
      {maxStepReached >= 6 && selectedAnimal && (
        <div ref={step6Ref} className="min-h-screen flex items-center justify-center py-12" style={{ scrollSnapAlign: 'start', scrollMarginTop: '80px' }}>
          <PredictionStep
            selectedAnimal={selectedAnimal}
            userSentences={sentences.map(s => s.sentence)}
            onNext={() => handleNext(6)}
            onPrevious={() => goToStep('sentence-input')}
          />
        </div>
      )}

      {/* Step 7: Reflection */}
      {maxStepReached >= 7 && (
        <div ref={step7Ref} className="min-h-screen flex items-center justify-center py-12" style={{ scrollSnapAlign: 'start', scrollMarginTop: '80px' }}>
          <ReflectionStep
            onNext={() => {
              alert('Activity complete! All steps finished.');
            }}
            onPrevious={() => goToStep('prediction')}
          />
        </div>
      )}
        </div>
      </div>

      {/* Debug Info */}
      <DebugInfo 
        currentStep={currentStepIndex} 
        maxStepReached={maxStepReached}
        selectedEcosystem={selectedEcosystem}
        selectedAnimal={selectedAnimal}
        sentences={sentences}
      />
    </div>
  );
}

export default function TestActivityStepsPage() {
  return (
    <ActivityProvider>
      <TestActivityStepsContent />
    </ActivityProvider>
  );
}
