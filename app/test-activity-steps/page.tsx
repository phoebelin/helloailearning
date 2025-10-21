/**
 * TEMPORARY TEST PAGE - DELETE BEFORE PRODUCTION
 * Manual testing page for all activity step components
 * Single-page scrollable experience
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { IntroductionStep } from '@/components/activity/introduction-step';
import { EcosystemSelectionStep } from '@/components/activity/ecosystem-selection-step';
import { KnowledgeVisualizationStep } from '@/components/activity/knowledge-visualization-step';
import { UnderstandingCheckStep } from '@/components/activity/understanding-check-step';
import { AnimalSelectionStep } from '@/components/activity/animal-selection-step';
import { ActivityProvider } from '@/lib/context/activity-context';
import { EcosystemType } from '@/types/activity';

type AnimalType = 'bees' | 'dolphins' | 'monkeys' | 'zebras';

function DebugInfo({ 
  currentStep, 
  maxStepReached,
  selectedEcosystem, 
  selectedAnimal 
}: { 
  currentStep: number; 
  maxStepReached: number;
  selectedEcosystem: EcosystemType | null; 
  selectedAnimal: AnimalType | null;
}) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs">
      <details className="bg-white border rounded-lg shadow-lg p-4">
        <summary className="font-medium cursor-pointer text-sm">Debug Info</summary>
        <div className="mt-2 text-xs space-y-1">
          <p><strong>Current Step:</strong> {currentStep + 1}</p>
          <p><strong>Max Step Reached:</strong> {maxStepReached + 1}</p>
          <p><strong>Steps Revealed:</strong> {maxStepReached + 1} of 5</p>
          <p><strong>Ecosystem:</strong> {selectedEcosystem || 'None'}</p>
          <p><strong>Animal:</strong> {selectedAnimal || 'None'}</p>
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

export default function TestActivityStepsPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [maxStepReached, setMaxStepReached] = useState(0);
  const [selectedEcosystem, setSelectedEcosystem] = useState<EcosystemType | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalType | null>(null);

  // Refs for each step to enable auto-scrolling
  const step0Ref = useRef<HTMLDivElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const step4Ref = useRef<HTMLDivElement>(null);

  const stepRefs = [step0Ref, step1Ref, step2Ref, step3Ref, step4Ref];

  // Auto-scroll to the current step when it changes
  useEffect(() => {
    if (currentStep > 0 && stepRefs[currentStep]?.current) {
      setTimeout(() => {
        stepRefs[currentStep].current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100); // Small delay to let the step render
    }
  }, [currentStep]);

  const handleNext = (stepIndex: number) => {
    if (stepIndex < 4) {
      const nextStep = stepIndex + 1;
      setCurrentStep(nextStep);
      setMaxStepReached(prev => Math.max(prev, nextStep));
    }
  };

  return (
    <ActivityProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Fixed Header - shows progress */}
        <div className="fixed top-0 left-0 right-0 bg-white border-b z-40 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold">Activity Steps Test</h1>
              
              {/* Progress indicators */}
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      step <= currentStep
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content with Snap Scrolling */}
        <div className="pt-20 pb-20 snap-y snap-mandatory overflow-y-auto h-screen">
        {/* Step 0: Introduction */}
        {currentStep >= 0 && (
          <div ref={step0Ref} className="min-h-screen flex items-center justify-center py-12 snap-center snap-always">
            <IntroductionStep
              onNext={() => handleNext(0)}
            />
          </div>
        )}

        {/* Step 1: Ecosystem Selection */}
        {currentStep >= 1 && (
          <div ref={step1Ref} data-step="ecosystem-selection" className="min-h-screen flex items-center justify-center py-12 snap-center snap-always">
            <EcosystemSelectionStep
              onNext={() => handleNext(1)}
              onEcosystemSelected={(ecosystem) => setSelectedEcosystem(ecosystem)}
              selectedEcosystem={selectedEcosystem}
            />
          </div>
        )}

        {/* Step 2: Knowledge Visualization */}
        {maxStepReached >= 2 && selectedEcosystem && (
          <div ref={step2Ref} data-step="knowledge-visualization" className="min-h-screen flex items-center justify-center py-12 snap-center snap-always">
            <KnowledgeVisualizationStep
              ecosystem={selectedEcosystem}
              onNext={() => handleNext(2)}
              onChangeEcosystem={() => setCurrentStep(1)}
            />
          </div>
        )}

        {/* Step 3: Understanding Check */}
        {maxStepReached >= 3 && selectedEcosystem && (
          <div ref={step3Ref} className="min-h-screen flex items-center justify-center py-12 snap-center snap-always">
            <UnderstandingCheckStep
              ecosystem={selectedEcosystem}
              onNext={() => handleNext(3)}
            />
          </div>
        )}

        {/* Step 4: Animal Selection */}
        {maxStepReached >= 4 && (
          <div ref={step4Ref} className="min-h-screen flex items-center justify-center py-12 snap-center snap-always">
            <AnimalSelectionStep
              onNext={() => {
                // Loop back or show completion
                alert('Activity complete! In production, this would continue to the next steps.');
              }}
              onAnimalSelected={(animal) => setSelectedAnimal(animal)}
              selectedAnimal={selectedAnimal}
            />
          </div>
        )}
        </div>

        {/* Debug Info */}
        <DebugInfo 
          currentStep={currentStep} 
          maxStepReached={maxStepReached}
          selectedEcosystem={selectedEcosystem}
          selectedAnimal={selectedAnimal}
        />
      </div>
    </ActivityProvider>
  );
}
