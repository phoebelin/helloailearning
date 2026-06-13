'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  MoriActivityState,
  MoriStep,
  TestedCreature,
  Creature,
} from '@/types/mori-activity';
import { LEVELS, getLevelByIndex, buildSortBatch, getAttendedFeatures } from '@/lib/data/mori-levels';
import { markActivityAsCompleted } from '@/lib/utils/activity-tracking';

// ---------- Context shape ----------

interface MoriActivityContextType {
  state: MoriActivityState;
  goToStep: (step: MoriStep) => void;
  nextStep: () => void;
  // Lab
  testCreature: (creature: Creature) => TestedCreature;
  // Sort
  generateSortBatch: () => void;
  setSortAssignment: (creatureId: string, bin: 'yes' | 'no') => void;
  submitSort: () => { passed: boolean; mismatches: string[] };
  resetSort: () => void;
  // Level progression
  advanceLevel: () => void;
  exitSession: () => void;
  resetActivity: () => void;
  // Derived
  currentLevel: ReturnType<typeof getLevelByIndex>;
  testedCount: number;
  failedSortAttempts: number;
}

const MoriActivityContext = createContext<MoriActivityContextType | undefined>(undefined);

// ---------- Step sequence ----------

const STEP_SEQUENCE: MoriStep[] = [
  'meet-mori',
  'feature-attention',
  'observe',
  'lab',
  'sort',
  'level-complete',
  'session-summary',
];

// ---------- localStorage ----------

const STORAGE_KEY = 'mori-v2-activity-state';

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

function persistState(state: MoriActivityState): void {
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

function makeInitialState(): MoriActivityState {
  const persisted = loadPersistedState();
  return {
    currentStep: 'meet-mori',
    stepIndex: 0,
    currentLevelIndex: 0,
    testedCreatures: [],
    failedSortAttempts: 0,
    sortBatch: null,
    sortAssignments: {},
    sortMismatches: [],
    levelsCompletedThisSession: [],
    sessionStartTime: Date.now(),
    totalLevelsCompleted: persisted.totalLevelsCompleted,
    highestLevelReached: persisted.highestLevelReached,
  };
}

// ---------- Provider ----------

export function MoriActivityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MoriActivityState>(makeInitialState);

  useEffect(() => {
    persistState(state);
  }, [state.totalLevelsCompleted, state.highestLevelReached]);

  // ---------- Navigation ----------

  const goToStep = useCallback((step: MoriStep) => {
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

  // ---------- Lab ----------

  const testCreature = useCallback((creature: Creature): TestedCreature => {
    let result!: TestedCreature;

    setState(prev => {
      const level = getLevelByIndex(prev.currentLevelIndex);
      if (!level) return prev;

      const verdict = level.trueRule(creature);
      const attendedFeatures = getAttendedFeatures(level);

      result = { creature, verdict, attendedFeatures };

      return {
        ...prev,
        testedCreatures: [...prev.testedCreatures, result],
      };
    });

    return result;
  }, []);

  // ---------- Sort ----------

  const generateSortBatch = useCallback(() => {
    setState(prev => {
      const level = getLevelByIndex(prev.currentLevelIndex);
      if (!level) return prev;
      const batch = buildSortBatch(level);
      return { ...prev, sortBatch: batch, sortAssignments: {}, sortMismatches: [] };
    });
  }, []);

  const setSortAssignment = useCallback((creatureId: string, bin: 'yes' | 'no') => {
    setState(prev => ({
      ...prev,
      sortAssignments: { ...prev.sortAssignments, [creatureId]: bin },
    }));
  }, []);

  const submitSort = useCallback((): { passed: boolean; mismatches: string[] } => {
    let result = { passed: false, mismatches: [] as string[] };

    setState(prev => {
      const level = getLevelByIndex(prev.currentLevelIndex);
      if (!level || !prev.sortBatch) return prev;

      const mismatches: string[] = [];
      for (const creature of prev.sortBatch) {
        const expected = level.trueRule(creature) ? 'yes' : 'no';
        const given = prev.sortAssignments[creature.id];
        if (!given || given !== expected) {
          mismatches.push(creature.id);
        }
      }

      const passed = mismatches.length === 0;
      result = { passed, mismatches };

      if (passed) {
        const levelNum = (prev.currentLevelIndex + 1) as 1 | 2 | 3 | 4;
        const newTotal = prev.totalLevelsCompleted + 1;
        const newHighest = Math.max(prev.highestLevelReached, levelNum);

        if (levelNum === 4) {
          markActivityAsCompleted('find-the-secret-rule');
        }

        return {
          ...prev,
          sortMismatches: [],
          levelsCompletedThisSession: [...prev.levelsCompletedThisSession, prev.currentLevelIndex],
          totalLevelsCompleted: newTotal,
          highestLevelReached: newHighest,
          currentStep: 'level-complete',
          stepIndex: STEP_SEQUENCE.indexOf('level-complete'),
        };
      }

      return {
        ...prev,
        sortMismatches: mismatches,
        failedSortAttempts: prev.failedSortAttempts + 1,
        currentStep: 'sort', // stay on sort to show mismatches
      };
    });

    return result;
  }, []);

  const resetSort = useCallback(() => {
    setState(prev => ({
      ...prev,
      sortAssignments: {},
      // Preserve sortMismatches so Lab can display which creatures need more testing.
      // Mismatches are cleared by generateSortBatch when the user starts a fresh sort attempt.
    }));
  }, []);

  // ---------- Level progression ----------

  const advanceLevel = useCallback(() => {
    setState(prev => {
      const nextLevelIndex = prev.currentLevelIndex + 1;
      const isLastLevel = prev.currentLevelIndex >= LEVELS.length - 1;

      if (isLastLevel) {
        return {
          ...prev,
          currentStep: 'session-summary',
          stepIndex: STEP_SEQUENCE.indexOf('session-summary'),
        };
      }

      return {
        ...prev,
        currentLevelIndex: nextLevelIndex,
        testedCreatures: [],
        failedSortAttempts: 0,
        sortBatch: null,
        sortAssignments: {},
        sortMismatches: [],
        currentStep: 'observe',
        stepIndex: STEP_SEQUENCE.indexOf('observe'),
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
      // keep cross-session progress
      totalLevelsCompleted: prev.totalLevelsCompleted,
      highestLevelReached: prev.highestLevelReached,
    }));
  }, []);

  // ---------- Derived ----------

  const currentLevel = getLevelByIndex(state.currentLevelIndex);
  const testedCount = state.testedCreatures.length;
  const failedSortAttempts = state.failedSortAttempts;

  const value: MoriActivityContextType = {
    state,
    goToStep,
    nextStep,
    testCreature,
    generateSortBatch,
    setSortAssignment,
    submitSort,
    resetSort,
    advanceLevel,
    exitSession,
    resetActivity,
    currentLevel,
    testedCount,
    failedSortAttempts,
  };

  return (
    <MoriActivityContext.Provider value={value}>
      {children}
    </MoriActivityContext.Provider>
  );
}

// ---------- Hooks ----------

export function useMoriActivity(): MoriActivityContextType {
  const ctx = useContext(MoriActivityContext);
  if (!ctx) throw new Error('useMoriActivity must be used within MoriActivityProvider');
  return ctx;
}

export function useMoriStep() {
  const { state } = useMoriActivity();
  return {
    currentStep: state.currentStep,
    stepIndex: state.stepIndex,
    totalSteps: STEP_SEQUENCE.length,
  };
}
