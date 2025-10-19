/**
 * Animal data for the teaching phase
 * Used in Step 4 (animal selection) and Step 8 (ecosystem prediction)
 */

import { Animal, AnimalType, EcosystemType } from '@/types/activity';

/**
 * Bees data
 */
const beesData: Animal = {
  id: 'bees',
  name: 'bees',
  displayName: 'Bees',
  habitatKeywords: [
    'flowers',
    'nectar',
    'pollen',
    'hive',
    'trees',
    'garden',
    'meadow',
    'plants',
    'blossoms',
    'honey',
    'forest',
    'warm',
    'temperate',
  ],
  ecosystemAffinity: {
    rainforest: 0.35,
    grassland: 0.30,
    desert: 0.05,
    ocean: 0.0,
    tundra: 0.05,
  },
};

/**
 * Dolphins data
 */
const dolphinsData: Animal = {
  id: 'dolphins',
  name: 'dolphins',
  displayName: 'Dolphins',
  habitatKeywords: [
    'ocean',
    'water',
    'sea',
    'saltwater',
    'marine',
    'coastal',
    'swim',
    'fish',
    'waves',
    'deep',
    'pod',
    'warm',
    'tropical',
  ],
  ecosystemAffinity: {
    ocean: 0.95,
    rainforest: 0.0,
    grassland: 0.0,
    desert: 0.0,
    tundra: 0.05, // Some dolphins in cold waters
  },
};

/**
 * Monkeys data
 */
const monkeysData: Animal = {
  id: 'monkeys',
  name: 'monkeys',
  displayName: 'Monkeys',
  habitatKeywords: [
    'trees',
    'forest',
    'jungle',
    'canopy',
    'branches',
    'climb',
    'fruit',
    'leaves',
    'tropical',
    'warm',
    'humid',
    'rainforest',
    'vines',
  ],
  ecosystemAffinity: {
    rainforest: 0.85,
    grassland: 0.10,
    desert: 0.0,
    ocean: 0.0,
    tundra: 0.0,
  },
};

/**
 * Zebras data
 */
const zebrasData: Animal = {
  id: 'zebras',
  name: 'zebras',
  displayName: 'Zebras',
  habitatKeywords: [
    'grass',
    'plains',
    'savanna',
    'grassland',
    'graze',
    'herd',
    'open',
    'field',
    'dry',
    'warm',
    'africa',
    'prairie',
  ],
  ecosystemAffinity: {
    grassland: 0.90,
    desert: 0.05,
    rainforest: 0.0,
    ocean: 0.0,
    tundra: 0.0,
  },
};

/**
 * Map of all animal data
 */
export const animalDatabase: Record<AnimalType, Animal> = {
  bees: beesData,
  dolphins: dolphinsData,
  monkeys: monkeysData,
  zebras: zebrasData,
};

/**
 * Array of all animals for iteration
 */
export const allAnimals: Animal[] = [
  beesData,
  dolphinsData,
  monkeysData,
  zebrasData,
];

/**
 * Get data for a specific animal
 */
export function getAnimalData(animalType: AnimalType): Animal {
  return animalDatabase[animalType];
}

/**
 * Get display name for an animal
 */
export function getAnimalDisplayName(animalType: AnimalType): string {
  return animalDatabase[animalType].displayName;
}

/**
 * Get habitat keywords for an animal
 */
export function getAnimalHabitatKeywords(animalType: AnimalType): string[] {
  return animalDatabase[animalType].habitatKeywords;
}

/**
 * Get ecosystem affinity scores for an animal
 */
export function getAnimalEcosystemAffinity(
  animalType: AnimalType
): Partial<Record<EcosystemType, number>> {
  return animalDatabase[animalType].ecosystemAffinity;
}

/**
 * Get the most likely ecosystem for an animal based on affinity
 */
export function getMostLikelyEcosystem(animalType: AnimalType): EcosystemType {
  const affinity = animalDatabase[animalType].ecosystemAffinity;
  let maxEcosystem: EcosystemType = 'rainforest';
  let maxScore = 0;

  (Object.entries(affinity) as [EcosystemType, number][]).forEach(([ecosystem, score]) => {
    if (score > maxScore) {
      maxScore = score;
      maxEcosystem = ecosystem;
    }
  });

  return maxEcosystem;
}

/**
 * Check if a keyword matches an animal's habitat
 */
export function isHabitatKeyword(animalType: AnimalType, keyword: string): boolean {
  const keywords = animalDatabase[animalType].habitatKeywords;
  return keywords.some(k => k.toLowerCase() === keyword.toLowerCase());
}

/**
 * Calculate ecosystem probability based on keywords found in sentences
 * This is used by the ML prediction model in Step 8
 */
export function calculateEcosystemProbability(
  animalType: AnimalType,
  foundKeywords: string[]
): Record<EcosystemType, number> {
  const animal = animalDatabase[animalType];
  const baseAffinity = animal.ecosystemAffinity;
  
  // Initialize scores with base affinity
  const scores: Record<EcosystemType, number> = {
    desert: baseAffinity.desert || 0,
    ocean: baseAffinity.ocean || 0,
    rainforest: baseAffinity.rainforest || 0,
    grassland: baseAffinity.grassland || 0,
    tundra: baseAffinity.tundra || 0,
  };

  // Ecosystem keyword mappings
  const ecosystemKeywords: Record<EcosystemType, string[]> = {
    desert: ['sand', 'hot', 'dry', 'cactus', 'arid', 'scarce'],
    ocean: ['water', 'sea', 'fish', 'swim', 'saltwater', 'marine', 'coral'],
    rainforest: ['trees', 'forest', 'jungle', 'humid', 'rain', 'tropical', 'canopy'],
    grassland: ['grass', 'plains', 'savanna', 'graze', 'open', 'prairie', 'herd'],
    tundra: ['cold', 'snow', 'ice', 'frozen', 'arctic', 'winter'],
  };

  // Boost scores based on found keywords
  foundKeywords.forEach(keyword => {
    const lowerKeyword = keyword.toLowerCase();
    (Object.entries(ecosystemKeywords) as [EcosystemType, string[]][]).forEach(
      ([ecosystem, keywords]) => {
        if (keywords.some(k => lowerKeyword.includes(k) || k.includes(lowerKeyword))) {
          scores[ecosystem] += 0.1; // Boost by 10% for each matching keyword
        }
      }
    );
  });

  // Normalize scores to sum to 1.0 (100%)
  const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
  if (total > 0) {
    (Object.keys(scores) as EcosystemType[]).forEach(ecosystem => {
      scores[ecosystem] = scores[ecosystem] / total;
    });
  }

  return scores;
}

/**
 * Get animal suggestions based on ecosystem
 * Useful for future features or recommendations
 */
export function getAnimalsForEcosystem(ecosystem: EcosystemType): Animal[] {
  return allAnimals
    .filter(animal => (animal.ecosystemAffinity[ecosystem] || 0) > 0.1)
    .sort((a, b) => 
      (b.ecosystemAffinity[ecosystem] || 0) - (a.ecosystemAffinity[ecosystem] || 0)
    );
}




