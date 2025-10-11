/**
 * Pre-populated knowledge base for ecosystem facts
 * Used in Step 2 to show Zhorai's existing knowledge about ecosystems
 */

import {
  EcosystemKnowledge,
  EcosystemType,
  MindmapData,
  NodeColor,
} from '@/types/activity';

/**
 * Desert ecosystem knowledge
 */
const desertKnowledge: EcosystemKnowledge = {
  ecosystem: 'desert',
  facts: [
    {
      id: 'desert-1',
      sentence: 'The desert has lots of sand',
      concepts: [
        { word: 'sand', type: 'concept', abundance: 'high', color: 'blue' },
        { word: 'desert', type: 'concept', abundance: 'high', color: 'blue' },
      ],
    },
    {
      id: 'desert-2',
      sentence: 'Deserts have very little water',
      concepts: [
        { word: 'water', type: 'concept', abundance: 'low', color: 'orange' },
      ],
    },
    {
      id: 'desert-3',
      sentence: 'Few plants grow in deserts',
      concepts: [
        { word: 'plants', type: 'concept', abundance: 'low', color: 'orange' },
      ],
    },
    {
      id: 'desert-4',
      sentence: 'Deserts are very hot during the day',
      concepts: [
        { word: 'hot', type: 'concept', abundance: 'high', color: 'blue' },
        { word: 'temperature', type: 'concept', abundance: 'high', color: 'blue' },
      ],
    },
    {
      id: 'desert-5',
      sentence: 'Cacti store water in their stems',
      concepts: [
        { word: 'cacti', type: 'concept', abundance: 'medium', color: 'neutral' },
        { word: 'adaptation', type: 'relationship', abundance: 'medium', color: 'purple' },
      ],
    },
  ],
  mindmap: {
    nodes: [
      {
        id: 'desert-node-1',
        label: 'sand',
        type: 'concept',
        color: 'blue',
        size: 80,
        sourceSentences: ['The desert has lots of sand'],
        connections: ['desert-node-2'],
      },
      {
        id: 'desert-node-2',
        label: 'plants',
        type: 'concept',
        color: 'orange',
        size: 40,
        sourceSentences: ['Few plants grow in deserts'],
        connections: ['desert-node-1', 'desert-node-3'],
      },
      {
        id: 'desert-node-3',
        label: 'water',
        type: 'concept',
        color: 'orange',
        size: 35,
        sourceSentences: ['Deserts have very little water'],
        connections: ['desert-node-2'],
      },
      {
        id: 'desert-node-4',
        label: 'hot',
        type: 'concept',
        color: 'blue',
        size: 70,
        sourceSentences: ['Deserts are very hot during the day'],
        connections: [],
      },
    ],
    edges: [
      { id: 'desert-edge-1', source: 'desert-node-1', target: 'desert-node-2' },
      { id: 'desert-edge-2', source: 'desert-node-2', target: 'desert-node-3' },
    ],
  },
};

/**
 * Ocean ecosystem knowledge
 */
const oceanKnowledge: EcosystemKnowledge = {
  ecosystem: 'ocean',
  facts: [
    {
      id: 'ocean-1',
      sentence: 'Oceans have lots of water',
      concepts: [
        { word: 'water', type: 'concept', abundance: 'high', color: 'blue' },
        { word: 'ocean', type: 'concept', abundance: 'high', color: 'blue' },
      ],
    },
    {
      id: 'ocean-2',
      sentence: 'Ocean water is salty',
      concepts: [
        { word: 'salt', type: 'concept', abundance: 'high', color: 'blue' },
      ],
    },
    {
      id: 'ocean-3',
      sentence: 'Many fish live in the ocean',
      concepts: [
        { word: 'fish', type: 'concept', abundance: 'high', color: 'blue' },
      ],
    },
    {
      id: 'ocean-4',
      sentence: 'Coral reefs grow in warm ocean waters',
      concepts: [
        { word: 'coral', type: 'concept', abundance: 'medium', color: 'neutral' },
        { word: 'warm', type: 'concept', abundance: 'medium', color: 'neutral' },
      ],
    },
    {
      id: 'ocean-5',
      sentence: 'The ocean floor has little sunlight',
      concepts: [
        { word: 'sunlight', type: 'concept', abundance: 'low', color: 'orange' },
        { word: 'deep', type: 'concept', abundance: 'high', color: 'blue' },
      ],
    },
  ],
  mindmap: {
    nodes: [
      {
        id: 'ocean-node-1',
        label: 'water',
        type: 'concept',
        color: 'blue',
        size: 90,
        sourceSentences: ['Oceans have lots of water'],
        connections: ['ocean-node-2', 'ocean-node-3'],
      },
      {
        id: 'ocean-node-2',
        label: 'fish',
        type: 'concept',
        color: 'blue',
        size: 75,
        sourceSentences: ['Many fish live in the ocean'],
        connections: ['ocean-node-1'],
      },
      {
        id: 'ocean-node-3',
        label: 'salt',
        type: 'concept',
        color: 'blue',
        size: 65,
        sourceSentences: ['Ocean water is salty'],
        connections: ['ocean-node-1'],
      },
      {
        id: 'ocean-node-4',
        label: 'sunlight',
        type: 'concept',
        color: 'orange',
        size: 30,
        sourceSentences: ['The ocean floor has little sunlight'],
        connections: [],
      },
    ],
    edges: [
      { id: 'ocean-edge-1', source: 'ocean-node-1', target: 'ocean-node-2' },
      { id: 'ocean-edge-2', source: 'ocean-node-1', target: 'ocean-node-3' },
    ],
  },
};

/**
 * Rainforest ecosystem knowledge
 */
const rainforestKnowledge: EcosystemKnowledge = {
  ecosystem: 'rainforest',
  facts: [
    {
      id: 'rainforest-1',
      sentence: 'Rainforests have lots of trees',
      concepts: [
        { word: 'trees', type: 'concept', abundance: 'high', color: 'blue' },
        { word: 'rainforest', type: 'concept', abundance: 'high', color: 'blue' },
      ],
    },
    {
      id: 'rainforest-2',
      sentence: 'It rains a lot in rainforests',
      concepts: [
        { word: 'rain', type: 'concept', abundance: 'high', color: 'blue' },
        { word: 'water', type: 'concept', abundance: 'high', color: 'blue' },
      ],
    },
    {
      id: 'rainforest-3',
      sentence: 'Many different animals live in rainforests',
      concepts: [
        { word: 'animals', type: 'concept', abundance: 'high', color: 'blue' },
        { word: 'diversity', type: 'concept', abundance: 'high', color: 'blue' },
      ],
    },
    {
      id: 'rainforest-4',
      sentence: 'Rainforests are warm and humid',
      concepts: [
        { word: 'warm', type: 'concept', abundance: 'high', color: 'blue' },
        { word: 'humid', type: 'concept', abundance: 'high', color: 'blue' },
      ],
    },
    {
      id: 'rainforest-5',
      sentence: 'Plants grow quickly in rainforests',
      concepts: [
        { word: 'plants', type: 'concept', abundance: 'high', color: 'blue' },
        { word: 'growth', type: 'verb', abundance: 'high', color: 'purple' },
      ],
    },
  ],
  mindmap: {
    nodes: [
      {
        id: 'rainforest-node-1',
        label: 'trees',
        type: 'concept',
        color: 'blue',
        size: 85,
        sourceSentences: ['Rainforests have lots of trees'],
        connections: ['rainforest-node-2', 'rainforest-node-3'],
      },
      {
        id: 'rainforest-node-2',
        label: 'rain',
        type: 'concept',
        color: 'blue',
        size: 80,
        sourceSentences: ['It rains a lot in rainforests'],
        connections: ['rainforest-node-1'],
      },
      {
        id: 'rainforest-node-3',
        label: 'animals',
        type: 'concept',
        color: 'blue',
        size: 75,
        sourceSentences: ['Many different animals live in rainforests'],
        connections: ['rainforest-node-1'],
      },
      {
        id: 'rainforest-node-4',
        label: 'warm',
        type: 'concept',
        color: 'blue',
        size: 60,
        sourceSentences: ['Rainforests are warm and humid'],
        connections: [],
      },
    ],
    edges: [
      { id: 'rainforest-edge-1', source: 'rainforest-node-1', target: 'rainforest-node-2' },
      { id: 'rainforest-edge-2', source: 'rainforest-node-1', target: 'rainforest-node-3' },
    ],
  },
};

/**
 * Grassland ecosystem knowledge
 */
const grasslandKnowledge: EcosystemKnowledge = {
  ecosystem: 'grassland',
  facts: [
    {
      id: 'grassland-1',
      sentence: 'Grasslands have lots of grass',
      concepts: [
        { word: 'grass', type: 'concept', abundance: 'high', color: 'blue' },
        { word: 'grassland', type: 'concept', abundance: 'high', color: 'blue' },
      ],
    },
    {
      id: 'grassland-2',
      sentence: 'Grasslands have few trees',
      concepts: [
        { word: 'trees', type: 'concept', abundance: 'low', color: 'orange' },
      ],
    },
    {
      id: 'grassland-3',
      sentence: 'Large herds of animals graze on grasslands',
      concepts: [
        { word: 'herds', type: 'concept', abundance: 'high', color: 'blue' },
        { word: 'grazing', type: 'verb', abundance: 'high', color: 'purple' },
      ],
    },
    {
      id: 'grassland-4',
      sentence: 'Grasslands have moderate rainfall',
      concepts: [
        { word: 'rain', type: 'concept', abundance: 'medium', color: 'neutral' },
      ],
    },
    {
      id: 'grassland-5',
      sentence: 'Grasslands experience seasonal changes',
      concepts: [
        { word: 'seasons', type: 'concept', abundance: 'high', color: 'blue' },
      ],
    },
  ],
  mindmap: {
    nodes: [
      {
        id: 'grassland-node-1',
        label: 'grass',
        type: 'concept',
        color: 'blue',
        size: 90,
        sourceSentences: ['Grasslands have lots of grass'],
        connections: ['grassland-node-2', 'grassland-node-3'],
      },
      {
        id: 'grassland-node-2',
        label: 'trees',
        type: 'concept',
        color: 'orange',
        size: 30,
        sourceSentences: ['Grasslands have few trees'],
        connections: ['grassland-node-1'],
      },
      {
        id: 'grassland-node-3',
        label: 'herds',
        type: 'concept',
        color: 'blue',
        size: 70,
        sourceSentences: ['Large herds of animals graze on grasslands'],
        connections: ['grassland-node-1'],
      },
      {
        id: 'grassland-node-4',
        label: 'seasons',
        type: 'concept',
        color: 'blue',
        size: 55,
        sourceSentences: ['Grasslands experience seasonal changes'],
        connections: [],
      },
    ],
    edges: [
      { id: 'grassland-edge-1', source: 'grassland-node-1', target: 'grassland-node-2' },
      { id: 'grassland-edge-2', source: 'grassland-node-1', target: 'grassland-node-3' },
    ],
  },
};

/**
 * Tundra ecosystem knowledge
 */
const tundraKnowledge: EcosystemKnowledge = {
  ecosystem: 'tundra',
  facts: [
    {
      id: 'tundra-1',
      sentence: 'Tundras are very cold',
      concepts: [
        { word: 'cold', type: 'concept', abundance: 'high', color: 'blue' },
        { word: 'tundra', type: 'concept', abundance: 'high', color: 'blue' },
      ],
    },
    {
      id: 'tundra-2',
      sentence: 'The ground in tundras is frozen',
      concepts: [
        { word: 'frozen', type: 'concept', abundance: 'high', color: 'blue' },
        { word: 'permafrost', type: 'concept', abundance: 'high', color: 'blue' },
      ],
    },
    {
      id: 'tundra-3',
      sentence: 'Few plants grow in tundras',
      concepts: [
        { word: 'plants', type: 'concept', abundance: 'low', color: 'orange' },
      ],
    },
    {
      id: 'tundra-4',
      sentence: 'Tundras have little rainfall',
      concepts: [
        { word: 'rain', type: 'concept', abundance: 'low', color: 'orange' },
      ],
    },
    {
      id: 'tundra-5',
      sentence: 'Snow covers tundras for much of the year',
      concepts: [
        { word: 'snow', type: 'concept', abundance: 'high', color: 'blue' },
      ],
    },
  ],
  mindmap: {
    nodes: [
      {
        id: 'tundra-node-1',
        label: 'cold',
        type: 'concept',
        color: 'blue',
        size: 85,
        sourceSentences: ['Tundras are very cold'],
        connections: ['tundra-node-2', 'tundra-node-4'],
      },
      {
        id: 'tundra-node-2',
        label: 'frozen',
        type: 'concept',
        color: 'blue',
        size: 75,
        sourceSentences: ['The ground in tundras is frozen'],
        connections: ['tundra-node-1'],
      },
      {
        id: 'tundra-node-3',
        label: 'plants',
        type: 'concept',
        color: 'orange',
        size: 25,
        sourceSentences: ['Few plants grow in tundras'],
        connections: [],
      },
      {
        id: 'tundra-node-4',
        label: 'snow',
        type: 'concept',
        color: 'blue',
        size: 70,
        sourceSentences: ['Snow covers tundras for much of the year'],
        connections: ['tundra-node-1'],
      },
    ],
    edges: [
      { id: 'tundra-edge-1', source: 'tundra-node-1', target: 'tundra-node-2' },
      { id: 'tundra-edge-2', source: 'tundra-node-1', target: 'tundra-node-4' },
    ],
  },
};

/**
 * Map of all ecosystem knowledge
 */
export const ecosystemKnowledgeBase: Record<EcosystemType, EcosystemKnowledge> = {
  desert: desertKnowledge,
  ocean: oceanKnowledge,
  rainforest: rainforestKnowledge,
  grassland: grasslandKnowledge,
  tundra: tundraKnowledge,
};

/**
 * Get knowledge for a specific ecosystem
 */
export function getEcosystemKnowledge(ecosystem: EcosystemType): EcosystemKnowledge {
  return ecosystemKnowledgeBase[ecosystem];
}

/**
 * Get mindmap data for a specific ecosystem
 */
export function getEcosystemMindmap(ecosystem: EcosystemType): MindmapData {
  return ecosystemKnowledgeBase[ecosystem].mindmap;
}

/**
 * Get all facts for a specific ecosystem
 */
export function getEcosystemFacts(ecosystem: EcosystemType): string[] {
  return ecosystemKnowledgeBase[ecosystem].facts.map(fact => fact.sentence);
}

/**
 * Helper to determine node color based on abundance
 */
export function getNodeColorFromAbundance(abundance: 'high' | 'low' | 'medium'): NodeColor {
  switch (abundance) {
    case 'high':
      return 'blue';
    case 'low':
      return 'orange';
    case 'medium':
      return 'neutral';
    default:
      return 'neutral';
  }
}

