import { ANIMALS, Animal } from './animals';
import { TrainingExample, PippyLevel } from '@/types/pippy-activity';
import { classifyAnimal, classifyBatch, computeAccuracy } from './pippy-prediction';

// ---------- Helpers ----------

function a(id: string): Animal {
  const animal = ANIMALS.find(x => x.id === id);
  if (!animal) throw new Error(`Animal not found: ${id}`);
  return animal;
}

function te(
  id: string,
  animalId: string,
  label: 'YES' | 'NO',
  step: number,
  isBadEgg: boolean
): TrainingExample {
  return { id, animal: a(animalId), label, addedAtStep: step, isBadEgg };
}

// ---------- Level 1: CATS (species; visible) ----------
// Rule: animal.group === 'cat'
// Bad egg: leopard labeled NO — a leopard is obviously a cat.
// Hook: tiger & house-cat, each with 5 and 4 attribute-matches to leopard respectively,
//       so with bad egg they land on leopard (NO) and are mispredicted.

const L1_TRAINING: TrainingExample[] = [
  te('l1-lion',     'lion',     'YES', 1, false),
  te('l1-cheetah',  'cheetah',  'YES', 2, false),
  te('l1-dog',      'dog',      'NO',  3, false),
  te('l1-elephant', 'elephant', 'NO',  4, false),
  te('l1-owl',      'owl',      'NO',  5, false),
  te('l1-dolphin',  'dolphin',  'NO',  6, false),
  te('l1-zebra',    'zebra',    'NO',  7, false),
  te('l1-leopard',  'leopard',  'NO',  8, true),   // BAD EGG — leopard is a cat!
];

const L1_TEST_ANIMALS: Animal[] = [a('tiger'), a('house-cat')];

// Check batch: hook animals + two clear NO animals (giraffe & rabbit nearest to non-cat NOs)
const L1_CHECK_BATCH: Animal[] = [a('tiger'), a('house-cat'), a('giraffe'), a('rabbit')];

// ---------- Level 2: OCEAN ANIMALS (habitat; semi-visible) ----------
// Rule: animal.habitat === 'ocean'
// Bad egg: seal labeled NO — seals live in the ocean.
// Hook: sea-lion (6/6 match to seal — same species group, habitat, diet, activity, body, size).
// Seal is added last (step 8) so that in tie-breaks, owl (step 5) beats seal for penguin.

const L2_TRAINING: TrainingExample[] = [
  te('l2-dolphin',   'dolphin',   'YES', 1, false),
  te('l2-octopus',   'octopus',   'YES', 2, false),
  te('l2-swordfish', 'swordfish', 'YES', 3, false),
  te('l2-lion',      'lion',      'NO',  4, false),
  te('l2-owl',       'owl',       'NO',  5, false),
  te('l2-parrot',    'parrot',    'NO',  6, false),
  te('l2-elephant',  'elephant',  'NO',  7, false),
  te('l2-seal',      'seal',      'NO',  8, true),  // BAD EGG — seal lives in the ocean!
];

const L2_TEST_ANIMALS: Animal[] = [a('sea-lion')];

// Check batch: hook + shark (YES via dolphin), penguin (NO trap — polar, not ocean),
// giraffe (clear NO via lion).
const L2_CHECK_BATCH: Animal[] = [a('sea-lion'), a('shark'), a('penguin'), a('giraffe')];

// ---------- Level 3: NIGHT ANIMALS (nocturnal; invisible) ----------
// Rule: animal.activity === 'nocturnal'
// Bad egg: owl labeled NO — owls are famously nocturnal.
// Hook: bat. With bad egg, bat's nearest neighbor is owl (4/6 matches: diet/activity/body/size)
//       which is labeled NO → bat mispredicted NO. After fix bat → owl(YES) → YES.
//
// bat.size=medium is intentional: it makes owl the unique nearest (4 matches)
// vs raccoon/hedgehog/moth (2 matches each).

const L3_TRAINING: TrainingExample[] = [
  te('l3-raccoon',   'raccoon',   'YES', 1, false),
  te('l3-hedgehog',  'hedgehog',  'YES', 2, false),
  te('l3-moth',      'moth',      'YES', 3, false),
  te('l3-squirrel',  'squirrel',  'NO',  4, false),
  te('l3-parrot',    'parrot',    'NO',  5, false),
  te('l3-deer',      'deer',      'NO',  6, false),
  te('l3-butterfly', 'butterfly', 'NO',  7, false),
  te('l3-owl',       'owl',       'NO',  8, true),  // BAD EGG — owls are night birds!
];

const L3_TEST_ANIMALS: Animal[] = [a('bat')];

// Check batch: bat (hook), tiger (YES via hedgehog), rabbit (NO via squirrel), lion (NO via deer)
const L3_CHECK_BATCH: Animal[] = [a('bat'), a('tiger'), a('rabbit'), a('lion')];

// ---------- Level definitions ----------

export const PIPPY_LEVELS: PippyLevel[] = [
  {
    id: 'pippy-level-1',
    index: 1,
    targetCategoryLabel: 'CATS',
    ruleAttribute: 'group',
    ruleValue: 'cat',
    trainingSet: L1_TRAINING,
    testAnimals: L1_TEST_ANIMALS,
    checkBatch: L1_CHECK_BATCH,
    expectedFix: { relabel: ['l1-leopard'] },
    takeaway:
      "Pippy isn't broken — it learned a wrong example. You could see it's a cat, but Pippy was told it wasn't. Fix the data, fix the understanding.",
  },
  {
    id: 'pippy-level-2',
    index: 2,
    targetCategoryLabel: 'OCEAN ANIMALS',
    ruleAttribute: 'habitat',
    ruleValue: 'ocean',
    trainingSet: L2_TRAINING,
    testAnimals: L2_TEST_ANIMALS,
    checkBatch: L2_CHECK_BATCH,
    expectedFix: { relabel: ['l2-seal'] },
    takeaway:
      "Fixing one wrong example changed what Pippy understands. An AI is never 'finished' — when the data changes, its understanding changes too.",
  },
  {
    id: 'pippy-level-3',
    index: 3,
    targetCategoryLabel: 'NIGHT ANIMALS',
    ruleAttribute: 'activity',
    ruleValue: 'nocturnal',
    trainingSet: L3_TRAINING,
    testAnimals: L3_TEST_ANIMALS,
    checkBatch: L3_CHECK_BATCH,
    expectedFix: { relabel: ['l3-owl'] },
    takeaway:
      "Pippy can't see if an animal sleeps at night — it only knows what its labels say. One wrong label taught it wrong. An AI is only as good as its data.",
  },
];

// ---------- Exported helpers ----------

export function getLevelByIndex(index: number): PippyLevel | undefined {
  return PIPPY_LEVELS[index];
}

export function getExpectedVerdict(animal: Animal, level: PippyLevel): 'YES' | 'NO' {
  return (animal[level.ruleAttribute] as string) === level.ruleValue ? 'YES' : 'NO';
}

export function getExpectedVerdicts(
  animals: Animal[],
  level: PippyLevel
): Record<string, 'YES' | 'NO'> {
  const map: Record<string, 'YES' | 'NO'> = {};
  for (const animal of animals) {
    map[animal.id] = getExpectedVerdict(animal, level);
  }
  return map;
}

export function computeAccuracyOnCheckBatch(
  workingNest: TrainingExample[],
  level: PippyLevel
): number {
  const expected = getExpectedVerdicts(level.checkBatch, level);
  const results = classifyBatch(level.checkBatch, workingNest);
  return computeAccuracy(results, expected);
}

export function getMissedAnimalIds(
  workingNest: TrainingExample[],
  level: PippyLevel
): string[] {
  const expected = getExpectedVerdicts(level.checkBatch, level);
  return level.checkBatch
    .map(animal => classifyAnimal(animal, workingNest))
    .filter(r => r.verdict !== expected[r.animalId])
    .map(r => r.animalId);
}

export function applyFix(
  nest: TrainingExample[],
  fix: { relabel?: string[]; remove?: string[] }
): TrainingExample[] {
  let result = [...nest];
  if (fix.remove?.length) {
    const removeSet = new Set(fix.remove);
    result = result.filter(e => !removeSet.has(e.id));
  }
  if (fix.relabel?.length) {
    const relabelSet = new Set(fix.relabel);
    result = result.map(e =>
      relabelSet.has(e.id)
        ? { ...e, label: (e.label === 'YES' ? 'NO' : 'YES') as 'YES' | 'NO' }
        : e
    );
  }
  return result;
}
