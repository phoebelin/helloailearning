/**
 * Activity Context for managing global state across the ecosystem learning activity
 * Provides state management for all 8 steps of the activity
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  ActivityState,
  ActivityStep,
  EcosystemType,
  AnimalType,
  Sentence,
  MindmapData,
  PredictionResult,
  ConceptData,
} from '@/types/activity';

interface ActivityContextType {
  // State
  state: ActivityState;
  
  // Navigation
  goToStep: (step: ActivityStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
  
  // Ecosystem selection (Step 1)
  selectEcosystem: (ecosystem: EcosystemType) => void;
  
  // Animal selection (Step 4)
  selectAnimal: (animal: AnimalType) => void;
  
  // Check for understanding (Step 3)
  setCheckAnswers: (answers: string[]) => void;
  
  // Sentence management (Steps 5-6)
  addSentence: (sentence: string) => void;
  editSentence: (id: string, sentence: string) => void;
  deleteSentence: (id: string) => void;
  updateSentenceConcepts: (id: string, concepts: ConceptData[]) => void;
  getSentenceCount: () => number;
  
  // Mindmap (Step 7)
  setMindmapData: (data: MindmapData) => void;
  
  // Prediction (Step 8)
  setPredictionResult: (result: PredictionResult) => void;
  
  // Speech tracking
  markKnowledgeVisualizationSpoken: (ecosystem: EcosystemType) => void;
  
  // Activity completion
  completeActivity: () => void;
  resetActivity: () => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

const stepSequence: ActivityStep[] = [
  'introduction',
  'ecosystem-selection',
  'knowledge-visualization',
  'understanding-check',
  'animal-selection',
  'sentence-input',
  'sentence-list',
  'mindmap-display',
  'prediction',
  'completion',
];

const STORAGE_KEY = 'activity-state';

/**
 * Load activity state from localStorage
 */
function loadStateFromStorage(): ActivityState | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    // Validate that the stored state has the expected structure
    if (parsed && typeof parsed === 'object' && 'currentStep' in parsed) {
      return parsed as ActivityState;
    }
  } catch (error) {
    console.warn('Failed to load activity state from localStorage:', error);
  }
  
  return null;
}

/**
 * Save activity state to localStorage
 */
function saveStateToStorage(state: ActivityState): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save activity state to localStorage:', error);
  }
}

/**
 * Clear activity state from localStorage
 */
function clearStateFromStorage(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear activity state from localStorage:', error);
  }
}

interface ActivityProviderProps {
  children: ReactNode;
  initialStep?: ActivityStep;
}

export function ActivityProvider({ children, initialStep = 'introduction' }: ActivityProviderProps) {
  // Initialize state from localStorage or use defaults
  const [state, setState] = useState<ActivityState>(() => {
    const stored = loadStateFromStorage();
    if (stored) {
      // Preserve the stored startTime if it exists, otherwise use current time
      // Ensure spokenEcosystems exists (for backward compatibility with old stored state)
      return {
        ...stored,
        startTime: stored.startTime || Date.now(),
        spokenEcosystems: stored.spokenEcosystems || [],
      };
    }
    
    // Default initial state
    return {
      currentStep: initialStep,
      stepIndex: stepSequence.indexOf(initialStep),
      selectedEcosystem: null,
      selectedAnimal: null,
      userSentences: [],
      checkAnswers: [],
      mindmapData: null,
      predictionResult: null,
      isComplete: false,
      startTime: Date.now(),
      hasKnowledgeVisualizationSpoken: false,
      spokenEcosystems: [],
    };
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  // Navigation functions
  const goToStep = useCallback((step: ActivityStep) => {
    const stepIndex = stepSequence.indexOf(step);
    if (stepIndex !== -1) {
      setState(prev => ({
        ...prev,
        currentStep: step,
        stepIndex,
      }));
    }
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => {
      const nextIndex = prev.stepIndex + 1;
      if (nextIndex < stepSequence.length) {
        return {
          ...prev,
          currentStep: stepSequence[nextIndex],
          stepIndex: nextIndex,
        };
      }
      return prev;
    });
  }, []);

  const previousStep = useCallback(() => {
    setState(prev => {
      const prevIndex = prev.stepIndex - 1;
      if (prevIndex >= 0) {
        return {
          ...prev,
          currentStep: stepSequence[prevIndex],
          stepIndex: prevIndex,
        };
      }
      return prev;
    });
  }, []);

  const canGoNext = useCallback((): boolean => {
    const { currentStep, selectedEcosystem, selectedAnimal, userSentences, checkAnswers } = state;

    switch (currentStep) {
      case 'introduction':
        return true;
      case 'ecosystem-selection':
        return selectedEcosystem !== null;
      case 'knowledge-visualization':
        return true;
      case 'understanding-check':
        // Assuming 2 correct answers required
        return checkAnswers.length === 2;
      case 'animal-selection':
        return selectedAnimal !== null;
      case 'sentence-input':
        return userSentences.length >= 3;
      case 'sentence-list':
        return userSentences.length >= 3;
      case 'mindmap-display':
        return true;
      case 'prediction':
        return true;
      case 'completion':
        return false;
      default:
        return false;
    }
  }, [state]);

  const canGoPrevious = useCallback((): boolean => {
    return state.stepIndex > 0 && state.currentStep !== 'completion';
  }, [state.stepIndex, state.currentStep]);

  // Ecosystem selection
  const selectEcosystem = useCallback((ecosystem: EcosystemType) => {
    setState(prev => ({
      ...prev,
      selectedEcosystem: ecosystem,
    }));
  }, []);

  // Animal selection
  const selectAnimal = useCallback((animal: AnimalType) => {
    setState(prev => ({
      ...prev,
      selectedAnimal: animal,
    }));
  }, []);

  // Check answers
  const setCheckAnswers = useCallback((answers: string[]) => {
    setState(prev => ({
      ...prev,
      checkAnswers: answers,
    }));
  }, []);

  // Sentence management
  const addSentence = useCallback((sentence: string) => {
    const newSentence: Sentence = {
      id: `sentence-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sentence,
      timestamp: Date.now(),
      animalId: state.selectedAnimal!,
      concepts: [], // Will be populated by concept extraction
    };

    setState(prev => ({
      ...prev,
      userSentences: [...prev.userSentences, newSentence],
    }));
  }, [state.selectedAnimal]);

  const editSentence = useCallback((id: string, sentence: string) => {
    setState(prev => ({
      ...prev,
      userSentences: prev.userSentences.map(s =>
        s.id === id ? { ...s, sentence, timestamp: Date.now() } : s
      ),
    }));
  }, []);

  const deleteSentence = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      userSentences: prev.userSentences.filter(sentence => sentence.id !== id),
    }));
  }, []);

  const getSentenceCount = useCallback((): number => {
    return state.userSentences.length;
  }, [state.userSentences.length]);

  const updateSentenceConcepts = useCallback((id: string, concepts: ConceptData[]) => {
    setState(prev => ({
      ...prev,
      userSentences: prev.userSentences.map(s =>
        s.id === id ? { ...s, concepts } : s
      ),
    }));
  }, []);

  // Mindmap
  const setMindmapData = useCallback((data: MindmapData) => {
    setState(prev => ({
      ...prev,
      mindmapData: data,
    }));
  }, []);

  // Prediction
  const setPredictionResult = useCallback((result: PredictionResult) => {
    setState(prev => ({
      ...prev,
      predictionResult: result,
    }));
  }, []);

  // Speech tracking
  const markKnowledgeVisualizationSpoken = useCallback((ecosystem: EcosystemType) => {
    setState(prev => ({
      ...prev,
      hasKnowledgeVisualizationSpoken: true,
      spokenEcosystems: prev.spokenEcosystems?.includes(ecosystem) 
        ? prev.spokenEcosystems 
        : [...(prev.spokenEcosystems || []), ecosystem],
    }));
  }, []);

  // Activity completion
  const completeActivity = useCallback(() => {
    setState(prev => ({
      ...prev,
      isComplete: true,
      endTime: Date.now(),
    }));
  }, []);

  const resetActivity = useCallback(() => {
    const newState = {
      currentStep: 'introduction' as ActivityStep,
      stepIndex: 0,
      selectedEcosystem: null,
      selectedAnimal: null,
      userSentences: [],
      checkAnswers: [],
      mindmapData: null,
      predictionResult: null,
      isComplete: false,
      startTime: Date.now(),
      hasKnowledgeVisualizationSpoken: false,
      spokenEcosystems: [],
    };
    setState(newState);
    clearStateFromStorage();
  }, []);

  const value: ActivityContextType = {
    state,
    goToStep,
    nextStep,
    previousStep,
    canGoNext,
    canGoPrevious,
    selectEcosystem,
    selectAnimal,
    setCheckAnswers,
    addSentence,
    editSentence,
    deleteSentence,
    updateSentenceConcepts,
    getSentenceCount,
    setMindmapData,
    setPredictionResult,
    markKnowledgeVisualizationSpoken,
    completeActivity,
    resetActivity,
  };

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
}

/**
 * Hook to use the activity context
 * Must be used within an ActivityProvider
 */
export function useActivity(): ActivityContextType {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
}

/**
 * Hook to get only the activity state (for read-only access)
 */
export function useActivityState(): ActivityState {
  const { state } = useActivity();
  return state;
}

/**
 * Hook to get current step information
 */
export function useCurrentStep() {
  const { state } = useActivity();
  return {
    currentStep: state.currentStep,
    stepIndex: state.stepIndex,
    totalSteps: stepSequence.length,
    progress: ((state.stepIndex + 1) / stepSequence.length) * 100,
  };
}

/**
 * Hook to get selected data
 */
export function useSelectedData() {
  const { state } = useActivity();
  return {
    ecosystem: state.selectedEcosystem,
    animal: state.selectedAnimal,
    sentences: state.userSentences,
    checkAnswers: state.checkAnswers,
  };
}

