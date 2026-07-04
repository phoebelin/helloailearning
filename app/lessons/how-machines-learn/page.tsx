/**
 * Chapter 1 — How Machines Learn with Zhorai
 * The ecosystem-learning activity: a single-page, scroll-driven sequence of step
 * components backed by the Zhorai ActivityProvider. See CLAUDE.md for the
 * activity-authoring pattern.
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
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

function HowMachinesLearnContent() {
  const router = useRouter();
  const {
    state,
    goToStep,
    selectEcosystem,
    selectAnimal,
    addSentence,
    editSentence,
    deleteSentence,
    updateSentenceConcepts,
  } = useActivity();

  // Convert context step to page step index
  const contextStepIndex = state.stepIndex;
  const currentStepIndex = stepToIndexMap[state.currentStep] ?? contextStepIndex;

  // Persist maxStepReached to localStorage so returning users resume at their saved position.
  // We load it once on mount (lazy initializer) and never initialise from context step, so
  // the user can only reach a step they've previously unlocked — not skip ahead.
  const [maxStepReached, setMaxStepReachedState] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const saved = localStorage.getItem('zhorai-max-step');
      return saved ? Math.max(0, parseInt(saved, 10)) : 0;
    } catch {
      return 0;
    }
  });

  const setMaxStepReached = useCallback((updater: number | ((prev: number) => number)) => {
    setMaxStepReachedState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try { localStorage.setItem('zhorai-max-step', String(next)); } catch {}
      return next;
    });
  }, []);

  const [visibleStepIndex, setVisibleStepIndex] = useState(maxStepReached);

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
  const hasRestoredScrollPositionRef = useRef(false);

  // On mount: scroll to the furthest step the user has previously reached.
  // Uses maxStepReached from localStorage so they resume right where they left off.
  useEffect(() => {
    if (maxStepReached === 0) {
      hasRestoredScrollPositionRef.current = true;
      return;
    }
    isNavigatingProgrammaticallyRef.current = true;
    const id = setTimeout(() => {
      stepRefs[maxStepReached]?.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
      setVisibleStepIndex(maxStepReached);
      hasRestoredScrollPositionRef.current = true;
      setTimeout(() => { isNavigatingProgrammaticallyRef.current = false; }, 500);
    }, 100);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only auto-scroll when step changes programmatically (via buttons), not during manual scrolling
  useEffect(() => {
    // Don't auto-scroll if we haven't restored the initial position yet
    if (!hasRestoredScrollPositionRef.current) return;
    
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
  // This updates both the progress tracker and context state to reflect scroll position
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    
    // Add a small delay to prevent initial load interference
    const timeoutId = setTimeout(() => {
      stepRefs.forEach((ref, index) => {
        if (!ref.current) return;
        
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                // Only update if we're not in the middle of programmatic navigation
                if (!isNavigatingProgrammaticallyRef.current) {
                  // Update visible step index for progress tracker
                  setVisibleStepIndex(index);
                  
                  // Also update context state to keep it in sync with scroll
                  const stepName = indexToStepMap[index];
                  if (stepName && stepName !== state.currentStep) {
                    goToStep(stepName as 'introduction' | 'ecosystem-selection' | 'knowledge-visualization' | 'understanding-check' | 'animal-selection' | 'sentence-input' | 'sentence-list' | 'mindmap-display' | 'prediction' | 'reflection' | 'completion');
                  }
                  
                  // Update maxStepReached to ensure future steps are rendered
                  setMaxStepReached(prev => Math.max(prev, index));
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
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observers.forEach(observer => observer.disconnect());
    };
  }, [stepRefs, maxStepReached, state.currentStep, goToStep]);

  // Advance to the step immediately after `fromStepIndex`. Each step's CTA passes its own
  // index, so a step's "Continue" always advances exactly one step — deterministically and
  // independent of scroll position or whether that step was completed before.
  const handleNext = (fromStepIndex: number) => {
    const currentVisibleIndex = fromStepIndex;
    if (currentVisibleIndex < 7) {
      const nextStepIndex = currentVisibleIndex + 1;
      const nextStep = indexToStepMap[nextStepIndex];
      if (nextStep) {
        // Mark that we're navigating programmatically
        isNavigatingProgrammaticallyRef.current = true;
        
        // Update maxStepReached first to ensure the next step is rendered
        setMaxStepReached(prev => Math.max(prev, nextStepIndex));
        
        // Update visibleStepIndex immediately to prevent flashing
        setVisibleStepIndex(nextStepIndex);
        
        // Then navigate to the next step
        goToStep(nextStep as 'introduction' | 'ecosystem-selection' | 'knowledge-visualization' | 'understanding-check' | 'animal-selection' | 'sentence-input' | 'sentence-list' | 'mindmap-display' | 'prediction' | 'reflection' | 'completion');
        
        // Ensure scroll happens after state update
        setTimeout(() => {
          const stepRef = stepRefs[nextStepIndex]?.current;
          if (stepRef) {
            stepRef.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
          // Re-enable scroll-driven state sync once the programmatic scroll settles,
          // matching the header nav buttons. Without this the scroll observer stays
          // disabled after a CTA, desyncing visibleStepIndex from the real position.
          setTimeout(() => { isNavigatingProgrammaticallyRef.current = false; }, 500);
        }, 100);
      }
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
  // Buttons use visibleStepIndex (what's actually scrolled to) instead of context state
  const handleHeaderPrevious = useCallback(() => {
    // Use visibleStepIndex - the step that's actually visible, not what context thinks
    if (visibleStepIndex <= 0) return;
    
    const prevIndex = visibleStepIndex - 1;
    const prevStepName = indexToStepMap[prevIndex];
    
    if (!prevStepName) return;
    
    // Mark that we're navigating programmatically to prevent Intersection Observer interference
    isNavigatingProgrammaticallyRef.current = true;
    
    // Update visibleStepIndex immediately to prevent flashing
    setVisibleStepIndex(prevIndex);
    
    // Update context state to keep it in sync
    goToStep(prevStepName as 'introduction' | 'ecosystem-selection' | 'knowledge-visualization' | 'understanding-check' | 'animal-selection' | 'sentence-input' | 'sentence-list' | 'mindmap-display' | 'prediction' | 'reflection' | 'completion');
    
    // Ensure scroll happens after state update
    setTimeout(() => {
      const stepRef = stepRefs[prevIndex]?.current;
      if (stepRef) {
        stepRef.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
      // Reset flag after scroll completes
      setTimeout(() => {
        isNavigatingProgrammaticallyRef.current = false;
      }, 500);
    }, 100);
  }, [goToStep, visibleStepIndex, stepRefs]);

  const handleHeaderNext = useCallback(() => {
    // Use visibleStepIndex - the step that's actually visible, not what context thinks
    if (visibleStepIndex >= totalSteps - 1) return;
    
    const nextIndex = visibleStepIndex + 1;
    const nextStep = indexToStepMap[nextIndex];
    
    if (!nextStep) return;
    
    // Mark that we're navigating programmatically to prevent Intersection Observer interference
    isNavigatingProgrammaticallyRef.current = true;
    
    // Update visibleStepIndex immediately to prevent flashing
    setVisibleStepIndex(nextIndex);
    
    // Update maxStepReached to ensure the next step is rendered
    setMaxStepReached(prev => Math.max(prev, nextIndex));
    
    // Update context state to keep it in sync
    goToStep(nextStep as 'introduction' | 'ecosystem-selection' | 'knowledge-visualization' | 'understanding-check' | 'animal-selection' | 'sentence-input' | 'sentence-list' | 'mindmap-display' | 'prediction' | 'reflection' | 'completion');
    
    // Ensure scroll happens after state update
    setTimeout(() => {
      const stepRef = stepRefs[nextIndex]?.current;
      if (stepRef) {
        stepRef.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
      // Reset flag after scroll completes
      setTimeout(() => {
        isNavigatingProgrammaticallyRef.current = false;
      }, 500);
    }, 100);
  }, [goToStep, visibleStepIndex, totalSteps, stepRefs]);

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Header - shows progress */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b z-40 shadow-xs">
        <div className="max-w-[1200px] mx-auto px-[60px] py-6">
          <div className="flex items-center justify-between">
            {/* Left spacer for balance */}
            <div className="w-20" />
            
            {/* Centered navigation */}
            <div className="flex items-center justify-center gap-3">
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={handleHeaderPrevious}
                       disabled={visibleStepIndex === 0}
                       className="text-sm"
                       icon={<ChevronLeft className="w-4 h-4" />}
                     >
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
                       disabled={visibleStepIndex >= maxStepReached}
                       className="text-sm"
                       endContent={<ChevronRight className="w-4 h-4" />}
                     >
                       Next
                     </Button>
            </div>
            
            {/* Right side - X button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/courses')}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
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
      {maxStepReached >= 1 && (
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
    </div>
  );
}

export default function HowMachinesLearnPage() {
  return (
    <ActivityProvider>
      <HowMachinesLearnContent />
    </ActivityProvider>
  );
}
