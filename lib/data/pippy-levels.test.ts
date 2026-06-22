/**
 * Validators for Pippy v2 level content.
 * Each level must satisfy three invariants:
 *   1. Clean set (no bad egg) → 100% accuracy on checkBatch
 *   2. With bad egg → the hook testAnimals are mispredicted
 *   3. After expectedFix → 100% accuracy on checkBatch
 *   4. An unrelated edit does NOT fix the level (wrong-animal fix fails)
 */
import {
  PIPPY_LEVELS,
  getExpectedVerdict,
  getExpectedVerdicts,
  computeAccuracyOnCheckBatch,
  applyFix,
} from './pippy-levels';
import { classifyAnimal } from './pippy-prediction';
import { TrainingExample } from '@/types/pippy-activity';

for (const level of PIPPY_LEVELS) {
  describe(`L${level.index}: ${level.targetCategoryLabel}`, () => {
    const badEgg = level.trainingSet.find(e => e.isBadEgg);
    if (!badEgg) throw new Error(`Level ${level.id} has no bad egg`);

    // Clean set: remove the bad egg and add it back with the correct label
    const cleanSet: TrainingExample[] = level.trainingSet.map(e =>
      e.isBadEgg
        ? { ...e, label: (e.label === 'YES' ? 'NO' : 'YES') as 'YES' | 'NO' }
        : e
    );

    it('clean training set achieves 100% on check batch', () => {
      const acc = computeAccuracyOnCheckBatch(cleanSet, level);
      expect(acc).toBe(1);
    });

    it('hook testAnimals are mispredicted with the bad egg present', () => {
      let anyWrong = false;
      for (const animal of level.testAnimals) {
        const result = classifyAnimal(animal, level.trainingSet);
        const expected = getExpectedVerdict(animal, level);
        if (result.verdict !== expected) {
          anyWrong = true;
          break;
        }
      }
      expect(anyWrong).toBe(true);
    });

    it('applying expectedFix achieves 100% on check batch', () => {
      const fixed = applyFix(level.trainingSet, level.expectedFix);
      const acc = computeAccuracyOnCheckBatch(fixed, level);
      expect(acc).toBe(1);
    });

    it('fixing an unrelated (non-bad-egg) example does NOT achieve 100%', () => {
      // Pick a non-bad-egg YES example to relabel; this should not fix the level
      const unrelatedYes = level.trainingSet.find(e => !e.isBadEgg && e.label === 'YES');
      if (!unrelatedYes) return; // skip if no suitable decoy
      const wrongFix = applyFix(level.trainingSet, { relabel: [unrelatedYes.id] });
      const acc = computeAccuracyOnCheckBatch(wrongFix, level);
      expect(acc).toBeLessThan(1);
    });

    it('hook testAnimals are correctly classified after expectedFix', () => {
      const fixed = applyFix(level.trainingSet, level.expectedFix);
      const expectedVerdicts = getExpectedVerdicts(level.testAnimals, level);
      for (const animal of level.testAnimals) {
        const result = classifyAnimal(animal, fixed);
        expect(result.verdict).toBe(expectedVerdicts[animal.id]);
      }
    });
  });
}
