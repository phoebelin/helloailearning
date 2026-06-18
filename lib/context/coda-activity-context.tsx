'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { CodaActivityState, CodaStep, CoinPlacement, RewardConfig, RunResult } from '@/types/coda-activity';
import { CODA_LEVELS, getLevelByIndex, matchesTarget } from '@/lib/data/coda-levels';
import { runAgent } from '@/lib/data/coda-planner';
import { markActivityAsCompleted } from '@/lib/utils/activity-tracking';

// ---------- Context shape ----------

interface CodaActivityContextType {
  state: CodaActivityState;
  goToStep: (step: CodaStep) => void;
  nextStep: () => void;
  // Reward editing
  placeCoin: (coin: CoinPlacement) => void;
  removeCoin: (coinId: string) => void;
  setRewardTerm: (term: 'stepCost' | 'scenicBonus' | 'hazardPenalty', value: number) => void;
  // Run
  runAgentForLevel: () => RunResult;
  // Level progression
  advanceLevel: () => void;
  resetRewardForLevel: () => void;
  resetActivity: () => void;
  // Derived
  currentLevel: ReturnType<typeof getLevelByIndex>;
  matchesCurrentTarget: boolean;
}

const CodaActivityContext = createContext<CodaActivityContextType | undefined>(undefined);

// ---------- Step sequence ----------

const STEP_SEQUENCE: CodaStep[] = [
  'meet-coda',
  'mission',
  'play',
  'level-complete',
  'session-summary',
];

// ---------- localStorage ----------

const STORAGE_KEY = 'coda-v1-activity-state';

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

function persistState(state: CodaActivityState): void {
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

function makeInitialState(): CodaActivityState {
  const persisted = loadPersistedState();
  const level = CODA_LEVELS[0];
  return {
    currentStep: 'meet-coda',
    stepIndex: 0,
    currentLevelIndex: 0,
    workingReward: { ...level.startingReward, coins: [...level.startingReward.coins] },
    lastRun: null,
    firstRun: null,
    runCountThisLevel: 0,
    levelsCompletedThisSession: [],
    sessionStartTime: Date.now(),
    totalLevelsCompleted: persisted.totalLevelsCompleted,
    highestLevelReached: persisted.highestLevelReached,
  };
}

// ---------- Provider ----------

export function CodaActivityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CodaActivityState>(makeInitialState);

  useEffect(() => {
    persistState(state);
  }, [state.totalLevelsCompleted, state.highestLevelReached]);

  // ---------- Navigation ----------

  const goToStep = useCallback((step: CodaStep) => {
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

  // ---------- Reward editing (principle d: never auto-suggested) ----------

  const placeCoin = useCallback((coin: CoinPlacement) => {
    setState(prev => ({
      ...prev,
      workingReward: {
        ...prev.workingReward,
        coins: [...prev.workingReward.coins.filter(c => c.id !== coin.id), coin],
      },
    }));
  }, []);

  const removeCoin = useCallback((coinId: string) => {
    setState(prev => ({
      ...prev,
      workingReward: {
        ...prev.workingReward,
        coins: prev.workingReward.coins.filter(c => c.id !== coinId),
      },
    }));
  }, []);

  const setRewardTerm = useCallback(
    (term: 'stepCost' | 'scenicBonus' | 'hazardPenalty', value: number) => {
      setState(prev => ({
        ...prev,
        workingReward: { ...prev.workingReward, [term]: value },
      }));
    },
    []
  );

  // ---------- Run ----------

  const runAgentForLevel = useCallback((): RunResult => {
    let result!: RunResult;

    setState(prev => {
      const level = getLevelByIndex(prev.currentLevelIndex);
      if (!level) return prev;

      result = runAgent(level.grid, prev.workingReward);

      return {
        ...prev,
        lastRun: result,
        firstRun: prev.firstRun ?? result,
        runCountThisLevel: prev.runCountThisLevel + 1,
        // The play step stays on its own surface — receipt appears in-place.
      };
    });

    return result;
  }, []);

  // ---------- Level progression ----------

  const resetRewardForLevel = useCallback(() => {
    setState(prev => {
      const level = getLevelByIndex(prev.currentLevelIndex);
      if (!level) return prev;
      return {
        ...prev,
        workingReward: { ...level.startingReward, coins: [...level.startingReward.coins] },
        lastRun: null,
        firstRun: null,
        runCountThisLevel: 0,
      };
    });
  }, []);

  const advanceLevel = useCallback(() => {
    setState(prev => {
      const levelNum = prev.currentLevelIndex + 1;
      const isLastLevel = prev.currentLevelIndex >= CODA_LEVELS.length - 1;

      if (isLastLevel) {
        markActivityAsCompleted('how-machines-chase-goals');
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
      const nextLevel = CODA_LEVELS[nextLevelIndex];

      return {
        ...prev,
        currentLevelIndex: nextLevelIndex,
        workingReward: { ...nextLevel.startingReward, coins: [...nextLevel.startingReward.coins] },
        lastRun: null,
        firstRun: null,
        runCountThisLevel: 0,
        levelsCompletedThisSession: [...prev.levelsCompletedThisSession, prev.currentLevelIndex],
        totalLevelsCompleted: prev.totalLevelsCompleted + 1,
        highestLevelReached: Math.max(prev.highestLevelReached, levelNum),
        currentStep: 'play',
        stepIndex: STEP_SEQUENCE.indexOf('play'),
      };
    });
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
  const matchesCurrentTarget = !!(state.lastRun && currentLevel && matchesTarget(state.lastRun, currentLevel));

  const value: CodaActivityContextType = {
    state,
    goToStep,
    nextStep,
    placeCoin,
    removeCoin,
    setRewardTerm,
    runAgentForLevel,
    advanceLevel,
    resetRewardForLevel,
    resetActivity,
    currentLevel,
    matchesCurrentTarget,
  };

  return (
    <CodaActivityContext.Provider value={value}>
      {children}
    </CodaActivityContext.Provider>
  );
}

// ---------- Hooks ----------

export function useCodaActivity(): CodaActivityContextType {
  const ctx = useContext(CodaActivityContext);
  if (!ctx) throw new Error('useCodaActivity must be used within CodaActivityProvider');
  return ctx;
}

export function useCodaStep() {
  const { state } = useCodaActivity();
  return {
    currentStep: state.currentStep,
    stepIndex: state.stepIndex,
    totalSteps: STEP_SEQUENCE.length,
  };
}
