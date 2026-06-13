import { Animal } from '@/lib/data/animals';
import { TrainingExample, PredictionResult } from '@/types/pippy-activity';

// k=1 nearest-neighbor classifier over 6 animal attributes.
// Similarity = count of matching attributes. Ties broken by earliest addedAtStep.

const ATTRIBUTES: (keyof Animal)[] = ['group', 'habitat', 'diet', 'activity', 'body', 'size'];

function countMatches(a: Animal, b: Animal): number {
  let n = 0;
  for (const attr of ATTRIBUTES) {
    if (a[attr] === b[attr]) n++;
  }
  return n;
}

export function classifyAnimal(
  animal: Animal,
  trainingSet: TrainingExample[]
): PredictionResult {
  if (trainingSet.length === 0) {
    return { animalId: animal.id, verdict: 'NO', confidence: 0, nearestNeighborIds: [] };
  }

  let bestScore = -1;
  let best: TrainingExample | null = null;

  for (const ex of trainingSet) {
    const score = countMatches(animal, ex.animal);
    if (
      score > bestScore ||
      (score === bestScore && ex.addedAtStep < (best?.addedAtStep ?? Infinity))
    ) {
      bestScore = score;
      best = ex;
    }
  }

  if (!best) {
    return { animalId: animal.id, verdict: 'NO', confidence: 0, nearestNeighborIds: [] };
  }

  return {
    animalId: animal.id,
    verdict: best.label,
    confidence: bestScore / ATTRIBUTES.length,
    nearestNeighborIds: [best.id],
  };
}

export function classifyBatch(
  animals: Animal[],
  trainingSet: TrainingExample[]
): PredictionResult[] {
  return animals.map(a => classifyAnimal(a, trainingSet));
}

// Returns top-k nearest training examples. Used by "Why did Pippy guess that?" tool.
export function getNearestNeighbors(
  animal: Animal,
  trainingSet: TrainingExample[],
  k: number = 1
): TrainingExample[] {
  if (trainingSet.length === 0) return [];

  const scored = trainingSet
    .map(ex => ({ ex, score: countMatches(animal, ex.animal) }))
    .sort((a, b) =>
      b.score !== a.score
        ? b.score - a.score
        : a.ex.addedAtStep - b.ex.addedAtStep
    );

  return scored.slice(0, k).map(s => s.ex);
}

export function computeAccuracy(
  results: PredictionResult[],
  expectedVerdicts: Record<string, 'YES' | 'NO'>
): number {
  if (results.length === 0) return 1;
  let correct = 0;
  for (const r of results) {
    if (r.verdict === expectedVerdicts[r.animalId]) correct++;
  }
  return correct / results.length;
}
