'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { PippyActivityState, PippyStep, TrainingExample } from '@/types/pippy-activity';
import { PIPPY_LEVELS, getLevelByIndex, getMissedAnimalIds } from '@/lib/data/pippy-levels';
import { markActivityAsCompleted } from '@/lib/utils/activity-tracking';

// ---------- Context shape ----------

interface PippyActivityContextType {
  state: PippyActivityState;
  goToStep: (step: PippyStep) => void;
  nextStep: () => void;
  // Training set editing
  relabelExample: (id: string) => void;
  removeExample: (id: string) => void;
  undoEdit: () => void;
  // Check batch
  runCheckBatch: () => { pass: boolean; misses: string[] };
  // Level progression
  advanceLevel: () => void;
  exitSession: () => void;
  resetActivity: () => void;
  // Derived
  currentLevel: ReturnType<typeof getLevelByIndex>;
  canUndo: boolean;
  failedCheckAttempts: number;
}

const PippyActivityContext = createContext<PippyActivityContextType | undefined>(undefined);

// ---------- Step sequence (mistake-first) ----------

const STEP_SEQUENCE: PippyStep[] = [
  'meet-pippy',
  'observe-mistake',
  'investigate-training',
  'inspect-fix',
  'check-batch',
  'level-complete',
  'session-summary',
];

// ---------- localStorage ----------

const STORAGE_KEY = 'pippy-v2-activity-state';

function loadPersistedState(): { totalLevelsCompleted: number; highestLevelReached: number } {
  if (typeof window === 'undefined') return { totalLevelsCompleted: 0, highestLevelReached: 1 };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { totalLevelsCompleted: 0, highestLevelReached: 1 };
    return JSON.parse(stored);
  } catch {
    return { totalLevelsCompleted: 0, highestLevelReached: 1 };
  }
}

function persistState(state: PippyActivityState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        totalLevelsCompleted: state.totalLevelsCompleted,
        highestLevelReached: state.highestLevelReached,
      })
    );
  } catch { /* ignore */ }
}

// ---------- Initial state factory ----------

function makeInitialState(): PippyActivityState {
  const persisted = loadPersistedState();
  const level = PIPPY_LEVELS[0];
  return {
    currentStep: 'meet-pippy',
    stepIndex: 0,
    currentLevelIndex: 0,
    workingNest: [...level.trainingSet],
    originalNest: [...level.trainingSet],
    undoStack: [],
    lastCheckPass: null,
    lastCheckMisses: [],
    failedCheckAttempts: 0,
    levelsCompletedThisSession: [],
    sessionStartTime: Date.now(),
    totalLevelsCompleted: persisted.totalLevelsCompleted,
    highestLevelReached: persisted.highestLevelReached,
  };
}

// ---------- Provider ----------

export function PippyActivityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PippyActivityState>(makeInitialState);

  useEffect(() => {
    persistState(state);
  }, [state.totalLevelsCompleted, state.highestLevelReached]);

  // ---------- Navigation ----------

  const goToStep = useCallback((step: PippyStep) => {
    const stepIndex = STEP_SEQUENCE.indexOf(step);
    if (stepIndex !== -1) {
      setState(prev => ({ ...prev, currentStep: step, stepIndex }));
    }
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => {
      const nextIndex = prev.stepIndex + 1;
      if (nextIndex < STEP_SEQUENCE.length) {
        return { ...prev, currentStep: STEP_SEQUENCE[nextIndex], stepIndex: nextIndex };
      }
      return prev;
    });
  }, []);

  // ---------- Training set editing ----------

  const relabelExample = useCallback((id: string) => {
    setState(prev => {
      const updated = prev.workingNest.map(e =>
        e.id === id
          ? { ...e, label: (e.label === 'YES' ? 'NO' : 'YES') as 'YES' | 'NO' }
          : e
      );
      return {
        ...prev,
        undoStack: [...prev.undoStack, prev.workingNest],
        workingNest: updated,
      };
    });
  }, []);

  const removeExample = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      undoStack: [...prev.undoStack, prev.workingNest],
      workingNest: prev.workingNest.filter(e => e.id !== id),
    }));
  }, []);

  const undoEdit = useCallback(() => {
    setState(prev => {
      if (prev.undoStack.length === 0) return prev;
      const stack = [...prev.undoStack];
      const restored = stack.pop()!;
      return { ...prev, undoStack: stack, workingNest: restored };
    });
  }, []);

  // ---------- Check batch ----------

  const runCheckBatch = useCallback((): { pass: boolean; misses: string[] } => {
    let result = { pass: false, misses: [] as string[] };

    setState(prev => {
      const level = getLevelByIndex(prev.currentLevelIndex);
      if (!level) return prev;

      const misses = getMissedAnimalIds(prev.workingNest, level);
      const pass = misses.length === 0;
      result = { pass, misses };

      return {
        ...prev,
        lastCheckPass: pass,
        lastCheckMisses: misses,
        failedCheckAttempts: pass ? prev.failedCheckAttempts : prev.failedCheckAttempts + 1,
      };
    });

    return result;
  }, []);

  // ---------- Level progression ----------

  const advanceLevel = useCallback(() => {
    setState(prev => {
      const levelNum = prev.currentLevelIndex + 1;
      const isLastLevel = prev.currentLevelIndex >= PIPPY_LEVELS.length - 1;

      if (isLastLevel) {
        markActivityAsCompleted('update-understanding-pippy');
        return {
          ...prev,
          levelsCompletedThisSession: [...prev.levelsCompletedThisSession, prev.currentLevelIndex],
          totalLevelsCompleted: prev.totalLevelsCompleted + 1,
          highestLevelReached: Math.max(prev.highestLevelReached, levelNum),
          currentStep: 'session-summary',
          stepIndex: STEP_SEQUENCE.indexOf('session-summary'),
        };
      }

      const nextLevelIndex = prev.currentLevelIndex + 1;
      const nextLevel = PIPPY_LEVELS[nextLevelIndex];

      return {
        ...prev,
        currentLevelIndex: nextLevelIndex,
        workingNest: [...nextLevel.trainingSet],
        originalNest: [...nextLevel.trainingSet],
        undoStack: [],
        lastCheckPass: null,
        lastCheckMisses: [],
        failedCheckAttempts: 0,
        levelsCompletedThisSession: [...prev.levelsCompletedThisSession, prev.currentLevelIndex],
        totalLevelsCompleted: prev.totalLevelsCompleted + 1,
        highestLevelReached: Math.max(prev.highestLevelReached, levelNum),
        currentStep: 'observe-mistake',
        stepIndex: STEP_SEQUENCE.indexOf('observe-mistake'),
      };
    });
  }, []);

  const exitSession = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: 'session-summary',
      stepIndex: STEP_SEQUENCE.indexOf('session-summary'),
    }));
  }, []);

  const resetActivity = useCallback(() => {
    setState(prev => ({
      ...makeInitialState(),
      totalLevelsCompleted: prev.totalLevelsCompleted,
      highestLevelReached: prev.highestLevelReached,
    }));
  }, []);

  // ---------- Derived ----------

  const currentLevel = getLevelByIndex(state.currentLevelIndex);
  const canUndo = state.undoStack.length > 0;
  const failedCheckAttempts = state.failedCheckAttempts;

  const value: PippyActivityContextType = {
    state,
    goToStep,
    nextStep,
    relabelExample,
    removeExample,
    undoEdit,
    runCheckBatch,
    advanceLevel,
    exitSession,
    resetActivity,
    currentLevel,
    canUndo,
    failedCheckAttempts,
  };

  return (
    <PippyActivityContext.Provider value={value}>
      {children}
    </PippyActivityContext.Provider>
  );
}

// ---------- Hooks ----------

export function usePippyActivity(): PippyActivityContextType {
  const ctx = useContext(PippyActivityContext);
  if (!ctx) throw new Error('usePippyActivity must be used within PippyActivityProvider');
  return ctx;
}

export function usePippyStep() {
  const { state } = usePippyActivity();
  return {
    currentStep: state.currentStep,
    stepIndex: state.stepIndex,
    totalSteps: STEP_SEQUENCE.length,
  };
}
