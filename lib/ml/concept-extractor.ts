/**
 * Concept Extractor - ML logic to extract key concepts from user sentences
 * Used in Steps 7-8 to analyze user-taught sentences about animals
 */

import { MindmapNode, NodeType, NodeColor, Sentence } from '@/types/activity';

/**
 * Extracted concept from a sentence
 */
export interface ExtractedConcept {
  word: string;
  type: NodeType;
  confidence: number;
  position: number;
  context: string;
}

/**
 * Relationship between concepts
 */
export interface ConceptRelationship {
  source: string;
  target: string;
  verb: string;
  confidence: number;
}

/**
 * Result of concept extraction from sentences
 */
export interface ConceptExtractionResult {
  concepts: ExtractedConcept[];
  relationships: ConceptRelationship[];
  mindmapNodes: MindmapNode[];
}

/**
 * Common animal-related nouns organized by category
 */
const ANIMAL_NOUNS = {
  // Bee-related
  bees: ['bee', 'bees', 'honeybee', 'honeybees', 'worker', 'queen', 'drone'],
  bee_habitat: ['hive', 'hives', 'nest', 'nests', 'colony', 'colonies', 'comb', 'combs'],
  bee_food: ['nectar', 'pollen', 'honey', 'flowers', 'blossoms', 'blooms'],
  bee_behavior: ['swarm', 'swarms', 'dance', 'dances', 'buzz', 'buzzing'],
  
  // Dolphin-related
  dolphins: ['dolphin', 'dolphins', 'porpoise', 'porpoises', 'cetacean', 'cetaceans'],
  dolphin_habitat: ['ocean', 'oceans', 'sea', 'seas', 'water', 'waves', 'currents'],
  dolphin_behavior: ['swim', 'swimming', 'jump', 'jumping', 'dive', 'diving', 'pod', 'pods'],
  dolphin_food: ['fish', 'fishes', 'squid', 'octopus', 'marine', 'prey'],
  
  // Monkey-related
  monkeys: ['monkey', 'monkeys', 'ape', 'apes', 'primate', 'primates'],
  monkey_habitat: ['trees', 'tree', 'forest', 'forests', 'jungle', 'jungles', 'canopy', 'branches'],
  monkey_behavior: ['climb', 'climbing', 'swing', 'swinging', 'jump', 'jumping', 'groom', 'grooming'],
  monkey_food: ['fruit', 'fruits', 'leaves', 'nuts', 'seeds', 'bananas', 'berries'],
  
  // Zebra-related
  zebras: ['zebra', 'zebras', 'equine', 'equines', 'herd', 'herds'],
  zebra_habitat: ['grass', 'plains', 'savanna', 'savannas', 'grassland', 'grasslands', 'field', 'fields'],
  zebra_behavior: ['graze', 'grazing', 'run', 'running', 'gallop', 'galloping', 'stampede'],
  zebra_food: ['grass', 'grass', 'plants', 'vegetation', 'hay'],
};

/**
 * Common verbs that indicate relationships
 */
const RELATIONSHIP_VERBS = [
  'eat', 'eats', 'eating', 'consume', 'consumes', 'consuming',
  'drink', 'drinks', 'drinking', 'sip', 'sips', 'sipping',
  'live', 'lives', 'living', 'dwell', 'dwells', 'dwelling', 'inhabit', 'inhabits',
  'fly', 'flies', 'flying', 'soar', 'soars', 'soaring',
  'swim', 'swims', 'swimming', 'dive', 'dives', 'diving',
  'climb', 'climbs', 'climbing', 'scale', 'scales', 'scaling',
  'run', 'runs', 'running', 'gallop', 'gallops', 'galloping',
  'jump', 'jumps', 'jumping', 'leap', 'leaps', 'leaping',
  'collect', 'collects', 'collecting', 'gather', 'gathers', 'gathering',
  'build', 'builds', 'building', 'construct', 'constructs', 'constructing',
  'make', 'makes', 'making', 'create', 'creates', 'creating',
  'find', 'finds', 'finding', 'discover', 'discovers', 'discovering',
  'hide', 'hides', 'hiding', 'conceal', 'conceals', 'concealing',
  'hunt', 'hunts', 'hunting', 'chase', 'chases', 'chasing',
  'play', 'plays', 'playing', 'frolic', 'frolics', 'frolicking',
  'sleep', 'sleeps', 'sleeping', 'rest', 'rests', 'resting',
];

/**
 * Habitat and environment keywords
 */
const HABITAT_KEYWORDS = [
  'hot', 'cold', 'warm', 'cool', 'wet', 'dry', 'humid', 'arid',
  'sunny', 'shady', 'bright', 'dark', 'loud', 'quiet',
  'trees', 'grass', 'water', 'sand', 'rocks', 'soil', 'mud',
  'forest', 'jungle', 'desert', 'ocean', 'sea', 'river', 'lake',
  'mountains', 'plains', 'valley', 'cave', 'burrow', 'nest',
];

/**
 * Extract concepts from a single sentence
 */
export function extractConceptsFromSentence(
  sentence: string,
  animalType: string
): ExtractedConcept[] {
  const concepts: ExtractedConcept[] = [];
  const words = sentence.toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 1); // Filter out single letters

  // Get relevant noun categories for this animal
  const relevantNouns = getRelevantNouns(animalType);
  
  words.forEach((word, index) => {
    // Check if it's a relevant noun
    const nounMatch = findNounMatch(word, relevantNouns);
    if (nounMatch) {
      concepts.push({
        word: word,
        type: 'concept',
        confidence: nounMatch.confidence,
        position: index,
        context: sentence,
      });
    }
    
    // Check if it's a habitat keyword
    if (HABITAT_KEYWORDS.includes(word)) {
      concepts.push({
        word: word,
        type: 'habitat',
        confidence: 0.8,
        position: index,
        context: sentence,
      });
    }
    
    // Check if it's a relationship verb
    if (RELATIONSHIP_VERBS.includes(word)) {
      concepts.push({
        word: word,
        type: 'verb',
        confidence: 0.9,
        position: index,
        context: sentence,
      });
    }
  });

  return concepts;
}

/**
 * Extract relationships between concepts in a sentence
 */
export function extractRelationships(
  sentence: string,
  concepts: ExtractedConcept[]
): ConceptRelationship[] {
  const relationships: ConceptRelationship[] = [];
  const words = sentence.toLowerCase().split(/\s+/);
  
  // Find verbs and their surrounding nouns
  concepts.forEach(concept => {
    if (concept.type === 'verb') {
      const verbIndex = concept.position;
      
      // Look for nouns before and after the verb
      const nounsBefore = concepts.filter(c => 
        c.type === 'concept' && c.position < verbIndex
      );
      const nounsAfter = concepts.filter(c => 
        c.type === 'concept' && c.position > verbIndex
      );
      
      // Create relationships
      nounsBefore.forEach(source => {
        nounsAfter.forEach(target => {
          relationships.push({
            source: source.word,
            target: target.word,
            verb: concept.word,
            confidence: Math.min(source.confidence, target.confidence, concept.confidence),
          });
        });
      });
    }
  });
  
  return relationships;
}

/**
 * Convert extracted concepts to mindmap nodes
 */
export function conceptsToMindmapNodes(
  concepts: ExtractedConcept[],
  relationships: ConceptRelationship[],
  sourceSentences: string[]
): MindmapNode[] {
  // Group concepts by word to avoid duplicates
  const conceptMap = new Map<string, ExtractedConcept[]>();
  
  concepts.forEach(concept => {
    const key = concept.word.toLowerCase();
    if (!conceptMap.has(key)) {
      conceptMap.set(key, []);
    }
    conceptMap.get(key)!.push(concept);
  });
  
  // Create mindmap nodes
  const nodes: MindmapNode[] = [];
  let nodeId = 0;
  
  conceptMap.forEach((conceptGroup, word) => {
    // Calculate average confidence and determine size
    const avgConfidence = conceptGroup.reduce((sum, c) => sum + c.confidence, 0) / conceptGroup.length;
    const size = Math.max(30, Math.min(100, avgConfidence * 100));
    
    // Determine color based on concept type and frequency
    let color: NodeColor = 'neutral';
    if (conceptGroup.some(c => c.type === 'habitat')) {
      color = 'purple';
    } else if (conceptGroup.length > 2) {
      color = 'blue'; // High frequency
    } else {
      color = 'orange'; // Low frequency
    }
    
    // Find connections for this node
    const connections: string[] = [];
    relationships.forEach(rel => {
      if (rel.source.toLowerCase() === word || rel.target.toLowerCase() === word) {
        const otherWord = rel.source.toLowerCase() === word ? rel.target : rel.source;
        if (!connections.includes(otherWord)) {
          connections.push(otherWord);
        }
      }
    });
    
    nodes.push({
      id: `extracted-node-${nodeId++}`,
      label: word,
      type: conceptGroup[0].type,
      color: color,
      size: size,
      sourceSentences: sourceSentences,
      connections: connections,
    });
  });
  
  return nodes;
}

/**
 * Main function to extract concepts from multiple sentences
 */
export function extractConceptsFromSentences(
  sentences: Sentence[],
  animalType: string
): ConceptExtractionResult {
  const allConcepts: ExtractedConcept[] = [];
  const allRelationships: ConceptRelationship[] = [];
  const sourceSentences: string[] = [];
  
  sentences.forEach(sentence => {
    const concepts = extractConceptsFromSentence(sentence.text, animalType);
    const relationships = extractRelationships(sentence.text, concepts);
    
    allConcepts.push(...concepts);
    allRelationships.push(...relationships);
    sourceSentences.push(sentence.text);
  });
  
  const mindmapNodes = conceptsToMindmapNodes(
    allConcepts,
    allRelationships,
    sourceSentences
  );
  
  return {
    concepts: allConcepts,
    relationships: allRelationships,
    mindmapNodes: mindmapNodes,
  };
}

/**
 * Helper function to get relevant nouns for an animal type
 */
function getRelevantNouns(animalType: string): Record<string, string[]> {
  const animal = animalType.toLowerCase();
  
  if (animal.includes('bee')) {
    return {
      ...ANIMAL_NOUNS.bees,
      ...ANIMAL_NOUNS.bee_habitat,
      ...ANIMAL_NOUNS.bee_food,
      ...ANIMAL_NOUNS.bee_behavior,
    };
  } else if (animal.includes('dolphin')) {
    return {
      ...ANIMAL_NOUNS.dolphins,
      ...ANIMAL_NOUNS.dolphin_habitat,
      ...ANIMAL_NOUNS.dolphin_behavior,
      ...ANIMAL_NOUNS.dolphin_food,
    };
  } else if (animal.includes('monkey')) {
    return {
      ...ANIMAL_NOUNS.monkeys,
      ...ANIMAL_NOUNS.monkey_habitat,
      ...ANIMAL_NOUNS.monkey_behavior,
      ...ANIMAL_NOUNS.monkey_food,
    };
  } else if (animal.includes('zebra')) {
    return {
      ...ANIMAL_NOUNS.zebras,
      ...ANIMAL_NOUNS.zebra_habitat,
      ...ANIMAL_NOUNS.zebra_behavior,
      ...ANIMAL_NOUNS.zebra_food,
    };
  }
  
  // Default to all nouns if animal type not recognized
  return {
    ...ANIMAL_NOUNS.bees,
    ...ANIMAL_NOUNS.dolphins,
    ...ANIMAL_NOUNS.monkeys,
    ...ANIMAL_NOUNS.zebras,
  };
}

/**
 * Helper function to find noun matches
 */
function findNounMatch(word: string, relevantNouns: Record<string, string[]>): { confidence: number } | null {
  const lowerWord = word.toLowerCase();
  
  // Direct match
  for (const category in relevantNouns) {
    if (relevantNouns[category].includes(lowerWord)) {
      return { confidence: 1.0 };
    }
  }
  
  // Partial match (word contains or is contained by a noun)
  for (const category in relevantNouns) {
    for (const noun of relevantNouns[category]) {
      if (lowerWord.includes(noun) || noun.includes(lowerWord)) {
        return { confidence: 0.7 };
      }
    }
  }
  
  return null;
}

/**
 * Get concept frequency analysis for visualization
 */
export function analyzeConceptFrequency(concepts: ExtractedConcept[]): Record<string, number> {
  const frequency: Record<string, number> = {};
  
  concepts.forEach(concept => {
    const word = concept.word.toLowerCase();
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  return frequency;
}

/**
 * Filter concepts by minimum confidence threshold
 */
export function filterConceptsByConfidence(
  concepts: ExtractedConcept[],
  minConfidence: number = 0.5
): ExtractedConcept[] {
  return concepts.filter(concept => concept.confidence >= minConfidence);
}
