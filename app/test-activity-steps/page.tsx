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
import { SentenceInputStep } from '@/components/activity/sentence-input-step';
import { PredictionStep } from '@/components/activity/prediction-step';
import { ActivityProvider, useActivity } from '@/lib/context/activity-context';
import { EcosystemType, Sentence } from '@/types/activity';
import { exposeDebugFunctions, testConceptExtraction, testSentimentExamples, testMindmapGeneration } from '@/lib/utils/debug-sentences';

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
  'completion': 6, // Same as prediction
};

const indexToStepMap: Record<number, string> = {
  0: 'introduction',
  1: 'ecosystem-selection',
  2: 'knowledge-visualization',
  3: 'understanding-check',
  4: 'animal-selection',
  5: 'sentence-input',
  6: 'prediction',
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
          <p><strong>Steps Revealed:</strong> {maxStepReached + 1} of 7</p>
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
    goToStep,
    selectEcosystem,
    selectAnimal,
    addSentence,
    editSentence,
    deleteSentence,
    updateSentenceConcepts,
  } = useActivity();

  // Convert context step to page step index
  const currentStepIndex = stepToIndexMap[state.currentStep] ?? 0;
  const [maxStepReached, setMaxStepReached] = useState(currentStepIndex);

  // Sync maxStepReached with current step
  useEffect(() => {
    setMaxStepReached(prev => Math.max(prev, currentStepIndex));
  }, [currentStepIndex]);

  // Refs for each step to enable auto-scrolling
  const step0Ref = useRef<HTMLDivElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const step4Ref = useRef<HTMLDivElement>(null);
  const step5Ref = useRef<HTMLDivElement>(null);
  const step6Ref = useRef<HTMLDivElement>(null);

  const stepRefs = [step0Ref, step1Ref, step2Ref, step3Ref, step4Ref, step5Ref, step6Ref];

  // Auto-scroll to the current step when it changes
  useEffect(() => {
    if (currentStepIndex > 0 && stepRefs[currentStepIndex]?.current) {
      setTimeout(() => {
        stepRefs[currentStepIndex].current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100); // Small delay to let the step render
    }
  }, [currentStepIndex, stepRefs]);

  const handleNext = (stepIndex: number) => {
    if (stepIndex < 6) {
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

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Header - shows progress */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Activity Steps Test</h1>
            
            {/* Progress indicators */}
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4, 5, 6].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    step <= currentStepIndex
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
      {currentStepIndex >= 0 && (
        <div ref={step0Ref} className="min-h-screen flex items-center justify-center py-12 snap-center snap-always">
          <IntroductionStep
            onNext={() => handleNext(0)}
            onPrevious={() => {}}
          />
        </div>
      )}

      {/* Step 1: Ecosystem Selection */}
      {currentStepIndex >= 1 && (
        <div ref={step1Ref} data-step="ecosystem-selection" className="min-h-screen flex items-center justify-center py-12 snap-center snap-always">
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
        <div ref={step2Ref} data-step="knowledge-visualization" className="min-h-screen flex items-center justify-center py-12 snap-center snap-always">
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
        <div ref={step3Ref} className="min-h-screen flex items-center justify-center py-12 snap-center snap-always">
          <UnderstandingCheckStep
            ecosystem={selectedEcosystem}
            onNext={() => handleNext(3)}
            onPrevious={() => goToStep('knowledge-visualization')}
          />
        </div>
      )}

      {/* Step 4: Animal Selection */}
      {maxStepReached >= 4 && (
        <div ref={step4Ref} className="min-h-screen flex items-center justify-center py-12 snap-center snap-always">
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
        <div ref={step5Ref} className="min-h-screen flex items-center justify-center py-12 snap-center snap-always">
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
        <div ref={step6Ref} className="min-h-screen flex items-center justify-center py-12 snap-center snap-always">
          <PredictionStep
            selectedAnimal={selectedAnimal}
            userSentences={sentences.map(s => s.sentence)}
            onNext={() => {
              alert('Activity complete! All steps finished.');
            }}
            onPrevious={() => goToStep('sentence-input')}
          />
        </div>
      )}
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
