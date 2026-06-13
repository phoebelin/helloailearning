import { Animal } from '@/lib/data/animals';

// ---------- Training example (one labeled card in the training set) ----------

export interface TrainingExample {
  id: string;
  animal: Animal;
  label: 'YES' | 'NO';
  addedAtStep: number;  // for training timeline
  isBadEgg: boolean;    // authored: the mislabeled example
}

// ---------- Prediction result ----------

export interface PredictionResult {
  animalId: string;
  verdict: 'YES' | 'NO';
  confidence: number;          // 0–1 (best match score / 6 attributes)
  nearestNeighborIds: string[]; // training example IDs Pippy leaned on
}

// ---------- Level definition ----------

export interface PippyLevel {
  id: string;
  index: 1 | 2 | 3;
  targetCategoryLabel: string;           // "CATS" | "OCEAN ANIMALS" | "NIGHT ANIMALS"
  ruleAttribute: keyof Animal;           // 'group' | 'habitat' | 'activity'
  ruleValue: string;                     // 'cat' | 'ocean' | 'nocturnal'
  trainingSet: TrainingExample[];        // includes exactly one bad egg
  testAnimals: Animal[];                 // hook animals (nearest neighbor of bad egg)
  checkBatch: Animal[];                  // re-test set
  expectedFix: { relabel?: string[]; remove?: string[] };
  takeaway: string;                      // visibility-ramp correction copy
}

// ---------- Steps (mistake-first order) ----------

export type PippyStep =
  | 'meet-pippy'
  | 'observe-mistake'
  | 'investigate-training'
  | 'inspect-fix'
  | 'check-batch'
  | 'level-complete'
  | 'session-summary';

// ---------- Activity state ----------

export interface PippyActivityState {
  currentStep: PippyStep;
  stepIndex: number;
  currentLevelIndex: number;
  // Mutable working copy of the training set for current level:
  workingNest: TrainingExample[];
  // Original training set snapshot (for "before" comparison in level-complete):
  originalNest: TrainingExample[];
  // Undo stack of working-nest snapshots (oldest first):
  undoStack: TrainingExample[][];
  // Latest check batch results:
  lastCheckPass: boolean | null;
  lastCheckMisses: string[];  // animal IDs still wrong
  failedCheckAttempts: number;
  // Tracking
  levelsCompletedThisSession: number[];
  sessionStartTime: number;
  // Cross-session (persisted)
  totalLevelsCompleted: number;
  highestLevelReached: number;
}

// ---------- Component props ----------

export interface PippyStepProps {
  onNext: () => void;
  onPrevious?: () => void;
}
