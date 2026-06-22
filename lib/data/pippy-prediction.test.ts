import { classifyAnimal, classifyBatch, getNearestNeighbors, computeAccuracy } from './pippy-prediction';
import { ANIMALS, Animal } from './animals';
import { TrainingExample } from '@/types/pippy-activity';

function getAnimal(id: string): Animal {
  const a = ANIMALS.find(x => x.id === id);
  if (!a) throw new Error(`Animal not found: ${id}`);
  return a;
}

function te(id: string, animalId: string, label: 'YES' | 'NO', step: number): TrainingExample {
  return { id, animal: getAnimal(animalId), label, addedAtStep: step, isBadEgg: false };
}

describe('classifyAnimal', () => {
  it('returns NO with 0 confidence for an empty training set', () => {
    const result = classifyAnimal(getAnimal('lion'), []);
    expect(result.verdict).toBe('NO');
    expect(result.confidence).toBe(0);
    expect(result.nearestNeighborIds).toHaveLength(0);
  });

  it('picks the training example with the most attribute matches', () => {
    const training = [
      te('a', 'lion', 'YES', 1),    // lion → 5/6 matches to cheetah
      te('b', 'dolphin', 'NO', 2),  // dolphin → 0+ matches to cheetah
    ];
    // cheetah: group=cat, habitat=savanna, diet=carnivore, activity=diurnal, body=legs, size=medium
    // lion:    group=cat, habitat=savanna, diet=carnivore, activity=diurnal, body=legs, size=large  (5/6)
    // dolphin: group=marine-mammal, habitat=ocean, diet=carnivore, activity=diurnal, body=fins, size=large (2/6)
    const result = classifyAnimal(getAnimal('cheetah'), training);
    expect(result.verdict).toBe('YES');
    expect(result.nearestNeighborIds).toContain('a');
  });

  it('breaks ties by earlier addedAtStep', () => {
    // tiger and lion both have identical attribute overlap with cheetah minus one attr
    // Create two perfect-score examples and verify the earlier step wins
    const training = [
      te('early', 'cheetah', 'YES', 1),
      te('late', 'cheetah', 'NO', 2),
    ];
    // Same animal (cheetah) in the training set → 6/6 match for both; earlier one wins
    const result = classifyAnimal(getAnimal('cheetah'), training);
    expect(result.verdict).toBe('YES');
    expect(result.nearestNeighborIds).toContain('early');
  });

  it('returns confidence as bestScore / 6', () => {
    const training = [te('a', 'lion', 'YES', 1)];
    // cheetah vs lion: group=cat✓, habitat=savanna✓, diet=carnivore✓, activity=diurnal✓, body=legs✓, size: medium≠large → 5/6
    const result = classifyAnimal(getAnimal('cheetah'), training);
    expect(result.confidence).toBeCloseTo(5 / 6);
  });
});

describe('classifyBatch', () => {
  it('classifies every animal in the array', () => {
    const training = [te('a', 'lion', 'YES', 1), te('b', 'dolphin', 'NO', 2)];
    const results = classifyBatch([getAnimal('cheetah'), getAnimal('shark')], training);
    expect(results).toHaveLength(2);
    expect(results[0].animalId).toBe('cheetah');
    expect(results[1].animalId).toBe('shark');
  });
});

describe('getNearestNeighbors', () => {
  it('returns top-k examples sorted by score descending, ties by step ascending', () => {
    const training = [
      te('high', 'cheetah', 'YES', 2),   // 6/6 match to cheetah
      te('med',  'lion',    'NO',  1),    // 5/6 match to cheetah
      te('low',  'dolphin', 'YES', 3),   // 2/6 match to cheetah
    ];
    const neighbors = getNearestNeighbors(getAnimal('cheetah'), training, 2);
    expect(neighbors).toHaveLength(2);
    expect(neighbors[0].id).toBe('high');
    expect(neighbors[1].id).toBe('med');
  });

  it('returns empty array for empty training set', () => {
    expect(getNearestNeighbors(getAnimal('lion'), [], 3)).toHaveLength(0);
  });
});

describe('computeAccuracy', () => {
  it('returns 1 when all verdicts match expected', () => {
    const results = [
      { animalId: 'lion', verdict: 'YES' as const, confidence: 1, nearestNeighborIds: [] },
      { animalId: 'dolphin', verdict: 'NO' as const, confidence: 0.5, nearestNeighborIds: [] },
    ];
    const expected = { lion: 'YES' as const, dolphin: 'NO' as const };
    expect(computeAccuracy(results, expected)).toBe(1);
  });

  it('returns 0.5 when half match', () => {
    const results = [
      { animalId: 'lion', verdict: 'YES' as const, confidence: 1, nearestNeighborIds: [] },
      { animalId: 'dolphin', verdict: 'YES' as const, confidence: 0.5, nearestNeighborIds: [] },
    ];
    const expected = { lion: 'YES' as const, dolphin: 'NO' as const };
    expect(computeAccuracy(results, expected)).toBe(0.5);
  });

  it('returns 1 for empty result set', () => {
    expect(computeAccuracy([], {})).toBe(1);
  });
});
