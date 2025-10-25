/**
 * Concept Extractor - ML logic to extract key concepts from user sentences
 * Used in Steps 7-8 to analyze user-taught sentences about animals
 */

import { MindmapNode, NodeType, NodeColor, Sentence, ConceptData } from '@/types/activity';

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
    const concepts = extractConceptsFromSentence(sentence.sentence, animalType);
    const relationships = extractRelationships(sentence.sentence, concepts);
    
    allConcepts.push(...concepts);
    allRelationships.push(...relationships);
    sourceSentences.push(sentence.sentence);
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
      bees: ANIMAL_NOUNS.bees,
      bee_habitat: ANIMAL_NOUNS.bee_habitat,
      bee_food: ANIMAL_NOUNS.bee_food,
      bee_behavior: ANIMAL_NOUNS.bee_behavior,
    };
  } else if (animal.includes('dolphin')) {
    return {
      dolphins: ANIMAL_NOUNS.dolphins,
      dolphin_habitat: ANIMAL_NOUNS.dolphin_habitat,
      dolphin_behavior: ANIMAL_NOUNS.dolphin_behavior,
      dolphin_food: ANIMAL_NOUNS.dolphin_food,
    };
  } else if (animal.includes('monkey')) {
    return {
      monkeys: ANIMAL_NOUNS.monkeys,
      monkey_habitat: ANIMAL_NOUNS.monkey_habitat,
      monkey_behavior: ANIMAL_NOUNS.monkey_behavior,
      monkey_food: ANIMAL_NOUNS.monkey_food,
    };
  } else if (animal.includes('zebra')) {
    return {
      zebras: ANIMAL_NOUNS.zebras,
      zebra_habitat: ANIMAL_NOUNS.zebra_habitat,
      zebra_behavior: ANIMAL_NOUNS.zebra_behavior,
      zebra_food: ANIMAL_NOUNS.zebra_food,
    };
  }
  
  // Default to all nouns if animal type not recognized
  return {
    bees: ANIMAL_NOUNS.bees,
    dolphins: ANIMAL_NOUNS.dolphins,
    monkeys: ANIMAL_NOUNS.monkeys,
    zebras: ANIMAL_NOUNS.zebras,
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
 * Extract concepts from a sentence in ecosystem knowledge format
 * Only extracts nouns and meaningful concepts, not verbs or common words
 */
export function extractConceptsFromSentenceEcosystemFormat(
  sentence: string,
  animalType: string
): ConceptData[] {
  const words = sentence.toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2); // Filter out short words

  const concepts: ConceptData[] = [];
  const wordCount: Record<string, number> = {};

  // Get relevant noun categories for this animal
  const relevantNouns = getRelevantNouns(animalType);

  // Count word frequency and classify words
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  // Only create concepts for meaningful words (nouns, habitats, not verbs)
  Object.entries(wordCount).forEach(([word, count]) => {
    let wordType: NodeType = 'concept';
    let shouldInclude = false;

    // Check if it's a relevant noun (these are true concepts)
    const nounMatch = findNounMatch(word, relevantNouns);
    if (nounMatch) {
      wordType = 'concept';
      shouldInclude = true;
    }
    
    // Check if it's a habitat keyword (only if not already found as noun)
    else if (HABITAT_KEYWORDS.includes(word)) {
      wordType = 'habitat';
      shouldInclude = true;
    }
    
    // Skip common verbs and action words - these are not concepts
    else if (RELATIONSHIP_VERBS.includes(word)) {
      // Don't include verbs as concepts
      shouldInclude = false;
    }
    
    // Skip common words that aren't meaningful concepts
    else if (isCommonWord(word)) {
      shouldInclude = false;
    }
    
    // Include other meaningful nouns (not in our predefined lists)
    else if (isLikelyNoun(word)) {
      wordType = 'concept';
      shouldInclude = true;
    }

    if (shouldInclude) {
      // Determine abundance based on sentiment, not frequency
      const abundance = determineSentimentAbundance(sentence, word, animalType);
      
      // Color mapping based on abundance
      let color: NodeColor;
      switch (abundance) {
        case 'high':
          color = 'blue';    // Positive relationships
          break;
        case 'low':
          color = 'orange';  // Negative/neutral relationships
          break;
        default:
          color = 'orange';  // Default to orange
      }
      
      concepts.push({
        word,
        type: wordType,
        abundance,
        color,
      });
    }
  });

  return concepts;
}

/**
 * Determine abundance based on sentiment/positivity of the relationship
 * High abundance = positive relationship (bees live in trees, ocean has water)
 * Low abundance = negative relationship (bees don't like water, deserts have little water)
 */
function determineSentimentAbundance(sentence: string, word: string, animalType: string): 'high' | 'low' {
  const lowerSentence = sentence.toLowerCase();
  const lowerWord = word.toLowerCase();
  const lowerAnimal = animalType.toLowerCase();
  
  // Positive indicators - suggest high abundance
  const positiveIndicators = [
    'live', 'lives', 'live in', 'lives in', 'found in', 'found', 'inhabit', 'inhabits',
    'make', 'makes', 'produce', 'produces', 'create', 'creates', 'build', 'builds',
    'eat', 'eats', 'consume', 'consumes', 'feed on', 'feeds on', 'drink', 'drinks',
    'have', 'has', 'contain', 'contains', 'full of', 'rich in', 'abundant', 'plenty',
    'like', 'likes', 'love', 'loves', 'enjoy', 'enjoys', 'prefer', 'prefers',
    'good', 'great', 'excellent', 'perfect', 'ideal', 'suitable', 'beneficial',
    'help', 'helps', 'support', 'supports', 'protect', 'protects', 'benefit', 'benefits'
  ];
  
  // Negative indicators - suggest low abundance
  const negativeIndicators = [
    'don\'t', 'do not', 'doesn\'t', 'does not', 'never', 'not', 'avoid', 'avoids',
    'hate', 'hates', 'dislike', 'dislikes', 'harmful', 'dangerous', 'toxic', 'poisonous',
    'bad', 'terrible', 'awful', 'poor', 'inadequate', 'insufficient', 'lack', 'lacks',
    'without', 'no', 'none', 'little', 'few', 'scarce', 'rare', 'uncommon',
    'kill', 'kills', 'destroy', 'destroys', 'damage', 'damages', 'hurt', 'hurts',
    'threaten', 'threatens', 'endanger', 'endangers', 'risk', 'risks'
  ];
  
  // Check for positive sentiment patterns
  const hasPositiveSentiment = positiveIndicators.some(indicator => {
    const pattern = new RegExp(`\\b${indicator}\\b`, 'i');
    return pattern.test(lowerSentence);
  });
  
  // Check for negative sentiment patterns
  const hasNegativeSentiment = negativeIndicators.some(indicator => {
    const pattern = new RegExp(`\\b${indicator}\\b`, 'i');
    return pattern.test(lowerSentence);
  });
  
  // Check for specific positive relationships
  const positivePatterns = [
    // Animal + positive verb + concept
    new RegExp(`\\b${lowerAnimal}\\b.*\\b(live|lives|inhabit|inhabits|found|make|produce|eat|consume|have|contain|like|likes|love|loves|visit|visits|collect|collects|gather|gathers|feed|feeds|drink|drinks)\\b.*\\b${lowerWord}\\b`, 'i'),
    // Concept + positive verb + animal
    new RegExp(`\\b${lowerWord}\\b.*\\b(contain|contains|have|has|support|supports|provide|provides|attract|attracts|feed|feeds)\\b.*\\b${lowerAnimal}\\b`, 'i'),
    // Positive adjectives
    new RegExp(`\\b${lowerWord}\\b.*\\b(good|great|excellent|perfect|ideal|suitable|beneficial|rich|abundant)\\b`, 'i'),
    new RegExp(`\\b(good|great|excellent|perfect|ideal|suitable|beneficial|rich|abundant)\\b.*\\b${lowerWord}\\b`, 'i')
  ];
  
  // Check for specific negative relationships
  const negativePatterns = [
    // Animal + negative verb + concept
    new RegExp(`\\b${lowerAnimal}\\b.*\\b(don't|do not|doesn't|does not|never|avoid|hate|dislike)\\b.*\\b${lowerWord}\\b`, 'i'),
    // Concept + negative verb + animal
    new RegExp(`\\b${lowerWord}\\b.*\\b(harmful|dangerous|toxic|poisonous|bad|terrible|awful)\\b.*\\b${lowerAnimal}\\b`, 'i'),
    // Negative adjectives
    new RegExp(`\\b${lowerWord}\\b.*\\b(bad|terrible|awful|poor|inadequate|insufficient|scarce|rare)\\b`, 'i'),
    new RegExp(`\\b(bad|terrible|awful|poor|inadequate|insufficient|scarce|rare)\\b.*\\b${lowerWord}\\b`, 'i'),
    // Lack/absence patterns
    new RegExp(`\\b(lack|lacks|without|no|none|little|few)\\b.*\\b${lowerWord}\\b`, 'i'),
    new RegExp(`\\b${lowerWord}\\b.*\\b(lack|lacks|without|no|none|little|few)\\b`, 'i')
  ];
  
  // Check for positive patterns
  const hasPositivePattern = positivePatterns.some(pattern => pattern.test(lowerSentence));
  
  // Check for negative patterns
  const hasNegativePattern = negativePatterns.some(pattern => pattern.test(lowerSentence));
  
  // Determine abundance based on sentiment
  if (hasNegativePattern || hasNegativeSentiment) {
    return 'low';
  } else {
    // Default to high for neutral or positive relationships
    return 'high';
  }
}

/**
 * Check if a word is a common word that shouldn't be treated as a concept
 */
function isCommonWord(word: string): boolean {
  const commonWords = [
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above',
    'below', 'between', 'among', 'this', 'that', 'these', 'those', 'a', 'an',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'can', 'must', 'shall', 'very', 'quite', 'rather', 'just', 'only', 'also',
    'too', 'either', 'neither', 'both', 'all', 'some', 'any', 'no', 'not',
    'here', 'there', 'where', 'when', 'why', 'how', 'what', 'who', 'which',
    // Common verbs that aren't meaningful concepts
    'like', 'likes', 'love', 'loves', 'want', 'wants', 'need', 'needs', 'get', 'gets',
    'make', 'makes', 'take', 'takes', 'give', 'gives', 'see', 'sees', 'know', 'knows',
    'think', 'thinks', 'feel', 'feels', 'seem', 'seems', 'look', 'looks', 'find', 'finds',
    'come', 'comes', 'go', 'goes', 'use', 'uses', 'work', 'works', 'call', 'calls',
    'try', 'tries', 'ask', 'asks', 'turn', 'turns', 'move', 'moves', 'play', 'plays',
    'run', 'runs', 'walk', 'walks', 'jump', 'jumps', 'fly', 'flies', 'swim', 'swims',
    'eat', 'eats', 'drink', 'drinks', 'sleep', 'sleeps', 'wake', 'wakes', 'live', 'lives',
    'die', 'dies', 'grow', 'grows', 'change', 'changes', 'help', 'helps', 'stop', 'stops',
    'start', 'starts', 'begin', 'begins', 'end', 'ends', 'finish', 'finishes',
    'visit', 'visits', 'collect', 'collects', 'gather', 'gathers', 'build', 'builds',
    'create', 'creates', 'produce', 'produces', 'consume', 'consumes', 'feed', 'feeds',
    'hunt', 'hunts', 'catch', 'catches', 'avoid', 'avoids', 'escape', 'escapes',
    'protect', 'protects', 'defend', 'defends', 'attack', 'attacks', 'fight', 'fights',
    'sit', 'sits', 'stand', 'stands', 'open', 'opens', 'close', 'closes', 'show', 'shows',
    'hide', 'hides', 'keep', 'keeps', 'hold', 'holds', 'carry', 'carries', 'bring', 'brings',
    'send', 'sends', 'leave', 'leaves', 'stay', 'stays', 'wait', 'waits', 'watch', 'watches',
    'listen', 'listens', 'hear', 'hears', 'smell', 'smells', 'taste', 'tastes', 'touch', 'touches',
    'hurt', 'hurts', 'break', 'breaks', 'fix', 'fixes', 'repair', 'repairs', 'clean', 'cleans',
    'wash', 'washes', 'cut', 'cuts', 'slice', 'slices', 'cook', 'cooks', 'bake', 'bakes',
    'boil', 'boils', 'freeze', 'freezes', 'melt', 'melts', 'burn', 'burns', 'light', 'lights',
    'learn', 'learns', 'teach', 'teaches', 'study', 'studies', 'read', 'reads', 'write', 'writes',
    'speak', 'speaks', 'talk', 'talks', 'tell', 'tells', 'say', 'says', 'sing', 'sings',
    'dance', 'dances', 'draw', 'draws', 'paint', 'paints'
  ];
  return commonWords.includes(word.toLowerCase());
}

/**
 * Simple heuristic to determine if a word is likely a noun
 * This is a basic implementation - in production you'd want more sophisticated NLP
 */
function isLikelyNoun(word: string): boolean {
  // Skip if it's already been classified as something else
  if (isCommonWord(word)) return false;
  
  // First check: Exclude obvious verbs and action words
  const verbEndings = ['ing', 'ed', 'en', 'ize', 'ise', 'ify', 'ate', 'ute'];
  if (verbEndings.some(ending => word.endsWith(ending))) return false;
  
  // Exclude common verbs and action words
  const commonVerbs = [
    'like', 'likes', 'love', 'loves', 'want', 'wants', 'need', 'needs', 'get', 'gets',
    'make', 'makes', 'take', 'takes', 'give', 'gives', 'see', 'sees', 'know', 'knows',
    'think', 'thinks', 'feel', 'feels', 'seem', 'seems', 'look', 'looks', 'find', 'finds',
    'come', 'comes', 'go', 'goes', 'use', 'uses', 'work', 'works', 'call', 'calls',
    'try', 'tries', 'ask', 'asks', 'turn', 'turns', 'move', 'moves', 'play', 'plays',
    'run', 'runs', 'walk', 'walks', 'jump', 'jumps', 'fly', 'flies', 'swim', 'swims',
    'eat', 'eats', 'drink', 'drinks', 'sleep', 'sleeps', 'wake', 'wakes', 'live', 'lives',
    'die', 'dies', 'grow', 'grows', 'change', 'changes', 'help', 'helps', 'stop', 'stops',
    'start', 'starts', 'begin', 'begins', 'end', 'ends', 'finish', 'finishes',
    'visit', 'visits', 'collect', 'collects', 'gather', 'gathers', 'build', 'builds',
    'create', 'creates', 'produce', 'produces', 'consume', 'consumes', 'feed', 'feeds',
    'hunt', 'hunts', 'catch', 'catches', 'avoid', 'avoids', 'escape', 'escapes',
    'protect', 'protects', 'defend', 'defends', 'attack', 'attacks', 'fight', 'fights'
  ];
  if (commonVerbs.includes(word.toLowerCase())) return false;
  
  // Second check: Include words with clear noun indicators
  // 1. Words ending in common noun suffixes
  const nounSuffixes = ['tion', 'sion', 'ness', 'ment', 'ity', 'ty', 'er', 'or', 'ist', 'ism', 'acy', 'cy'];
  if (nounSuffixes.some(suffix => word.endsWith(suffix))) return true;
  
  // 2. Words that are clearly nouns (animals, objects, concepts)
  const likelyNouns = [
    'animal', 'animals', 'creature', 'creatures', 'species', 'group', 'family',
    'food', 'water', 'air', 'land', 'ground', 'tree', 'trees', 'plant', 'plants',
    'flower', 'flowers', 'fruit', 'fruits', 'seed', 'seeds', 'leaf', 'leaves',
    'home', 'house', 'nest', 'nests', 'cave', 'caves', 'hole', 'holes',
    'color', 'colors', 'size', 'shape', 'sound', 'sounds', 'smell', 'smells',
    'behavior', 'behaviors', 'habit', 'habits', 'pattern', 'patterns',
    'environment', 'environments', 'habitat', 'habitats', 'ecosystem', 'ecosystems',
    'honey', 'nectar', 'pollen', 'wax', 'venom', 'poison', 'milk', 'blood',
    'skin', 'fur', 'feather', 'feathers', 'wing', 'wings', 'tail', 'tails',
    'eye', 'eyes', 'ear', 'ears', 'nose', 'mouth', 'tooth', 'teeth',
    'leg', 'legs', 'foot', 'feet', 'hand', 'hands', 'finger', 'fingers',
    'bone', 'bones', 'muscle', 'muscles', 'brain', 'heart', 'lung', 'lungs',
    'egg', 'eggs', 'baby', 'babies', 'child', 'children', 'adult', 'adults',
    'male', 'males', 'female', 'females', 'parent', 'parents', 'offspring',
    'wasp', 'wasps', 'ant', 'ants', 'spider', 'spiders', 'fly', 'flies', 'bug', 'bugs'
  ];
  if (likelyNouns.includes(word.toLowerCase())) return true;
  
  // 3. Capitalized words (likely proper nouns)
  if (word[0] === word[0].toUpperCase() && word.length > 2) return true;
  
  // 4. Very conservative approach: only include longer words that are likely meaningful nouns
  // and don't match any verb patterns
  return word.length >= 4 && !word.includes('ing') && !word.includes('ed');
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
