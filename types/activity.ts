/**
 * Type definitions for the Ecosystem Learning Activity with Zhorai
 * Based on PRD: 0001-prd-ecosystem-learning-activity.md
 */

// Ecosystem types
export type EcosystemType = 'desert' | 'ocean' | 'rainforest' | 'grassland' | 'tundra';

export interface Ecosystem {
  id: EcosystemType;
  name: string;
  description: string;
  characteristics: string[];
}

// Animal types
export type AnimalType = 'bees' | 'dolphins' | 'monkeys' | 'zebras';

export interface Animal {
  id: AnimalType;
  name: string;
  displayName: string;
  habitatKeywords: string[];
  ecosystemAffinity: Partial<Record<EcosystemType, number>>;
}

// Sentence and learning types
export interface Sentence {
  id: string;
  sentence: string;
  timestamp: number;
  animalId: AnimalType;
  concepts: ConceptData[];
  confidence?: number;
}

// Mindmap types
export type NodeType = 'concept' | 'verb' | 'relationship' | 'habitat';
export type NodeColor = 'blue' | 'orange' | 'purple' | 'neutral';

export interface MindmapNode {
  id: string;
  label: string;
  type: NodeType;
  color: NodeColor;
  size: number;
  sourceSentences: string[];
  connections: string[];
  x?: number;
  y?: number;
}

export interface MindmapData {
  nodes: MindmapNode[];
  edges: MindmapEdge[];
}

export interface MindmapEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

// Prediction types
export interface PredictionResult {
  ecosystems: EcosystemPrediction[];
  topPrediction: EcosystemType;
  confidence: number;
  reasoning: string[];
}

export interface EcosystemPrediction {
  ecosystem: EcosystemType;
  probability: number;
  influencingSentences: string[];
  keywords: string[];
}

// Activity state types
export type ActivityStep = 
  | 'introduction'
  | 'ecosystem-selection'
  | 'knowledge-visualization'
  | 'understanding-check'
  | 'animal-selection'
  | 'sentence-input'
  | 'sentence-list'
  | 'mindmap-display'
  | 'prediction'
  | 'completion';

export interface ActivityState {
  currentStep: ActivityStep;
  stepIndex: number;
  selectedEcosystem: EcosystemType | null;
  selectedAnimal: AnimalType | null;
  userSentences: Sentence[];
  checkAnswers: string[];
  mindmapData: MindmapData | null;
  predictionResult: PredictionResult | null;
  isComplete: boolean;
  startTime: number;
  endTime?: number;
  hasKnowledgeVisualizationSpoken?: boolean;
}

// Step component props
export interface StepComponentProps {
  onNext: () => void;
  onPrevious: () => void;
  onComplete?: () => void;
}

// Audio/Speech types
export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface AudioRecorderState {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
}

// Knowledge base types
export interface EcosystemKnowledge {
  ecosystem: EcosystemType;
  facts: KnowledgeFact[];
  mindmap: MindmapData;
}

export interface KnowledgeFact {
  id: string;
  sentence: string;
  concepts: ConceptData[];
}

export interface ConceptData {
  word: string;
  type: NodeType;
  abundance: 'high' | 'low' | 'medium';
  color: NodeColor;
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface SentenceValidation extends ValidationResult {
  hasSubject: boolean;
  hasPredicate: boolean;
  isRelevant: boolean;
  wordCount: number;
  minWordCount: number;
}

// UI Component types
export interface ProgressIndicator {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
}

export interface CheckAnswer {
  id: string;
  text: string;
  isCorrect: boolean;
  isSelected: boolean;
}

// Response types for Zhorai
export type ZhoraiEmotion = 'happy' | 'confused' | 'excited' | 'thinking' | 'neutral';

export interface ZhoraiResponse {
  text: string;
  emotion: ZhoraiEmotion;
  audioUrl?: string;
  useTTS?: boolean;
}

