/**
 * Semantic Similarity Module
 * Improved semantic similarity calculation using pre-computed relationships
 * This is a lightweight, browser-friendly alternative to WordNet
 */

export interface WordDescriptor {
  count: number;
  word: string;
}

/**
 * Pre-computed semantic relationships based on linguistic knowledge
 * These relationships help identify when user words relate to ecosystem concepts
 * even when they don't exactly match keywords
 */
const SEMANTIC_RELATIONSHIPS: Record<string, string[]> = {
  // Trees & Forest
  'tree': ['forest', 'jungle', 'rainforest', 'canopy', 'wood', 'trunk', 'branch', 'branches', 'foliage'],
  'trees': ['forest', 'jungle', 'rainforest', 'canopy', 'wood', 'trunk', 'branch', 'branches', 'foliage'],
  'branch': ['tree', 'forest', 'jungle', 'rainforest', 'canopy', 'trunk', 'wood'],
  'branches': ['tree', 'forest', 'jungle', 'rainforest', 'canopy', 'trunk', 'wood'],
  'leaf': ['tree', 'leaves', 'foliage', 'vegetation', 'green'],
  'leaves': ['tree', 'leaf', 'foliage', 'vegetation', 'green'],
  'vine': ['tree', 'forest', 'jungle', 'rainforest', 'tropical', 'plant'],
  'vines': ['tree', 'forest', 'jungle', 'rainforest', 'tropical', 'plant'],
  'fruit': ['tree', 'jungle', 'rainforest', 'tropical', 'plant'],
  'nuts': ['tree', 'jungle', 'forest', 'plant'],
  'jungle': ['tree', 'forest', 'rainforest', 'tropical', 'dense', 'green'],
  'forest': ['tree', 'jungle', 'rainforest', 'canopy', 'green', 'dense'],
  
  // Ocean & Water
  'water': ['ocean', 'sea', 'aquatic', 'marine', 'wet', 'wave', 'waves'],
  'ocean': ['water', 'sea', 'marine', 'aquatic', 'saltwater', 'blue', 'deep'],
  'sea': ['water', 'ocean', 'marine', 'aquatic', 'saltwater', 'waves'],
  'wave': ['water', 'ocean', 'sea', 'beach', 'shore', 'surf'],
  'waves': ['water', 'ocean', 'sea', 'beach', 'shore', 'surf'],
  'shore': ['water', 'ocean', 'sea', 'beach', 'coast', 'sand'],
  'beach': ['water', 'ocean', 'sea', 'shore', 'sand', 'coast'],
  'coast': ['water', 'ocean', 'sea', 'beach', 'shore'],
  'clam': ['water', 'ocean', 'sea', 'marine', 'aquatic', 'shell'],
  'crabs': ['water', 'ocean', 'sea', 'marine', 'beach', 'shell'],
  'fish': ['water', 'ocean', 'sea', 'marine', 'aquatic'],
  'swim': ['water', 'ocean', 'sea', 'aquatic'],
  
  // Grassland & Prairie
  'grass': ['field', 'plains', 'meadow', 'prairie', 'savanna', 'pasture', 'open'],
  'field': ['grass', 'plains', 'meadow', 'prairie', 'savanna', 'pasture', 'open'],
  'plains': ['grass', 'field', 'meadow', 'prairie', 'savanna', 'flat', 'open'],
  'herd': ['grass', 'field', 'plains', 'savanna', 'prairie', 'meadow', 'grazing', 'animals'],
  'herds': ['grass', 'field', 'plains', 'savanna', 'prairie', 'meadow', 'grazing', 'animals'],
  'hay': ['grass', 'field', 'plains', 'meadow', 'pasture', 'plant'],
  'pasture': ['grass', 'field', 'plains', 'meadow', 'prairie', 'grazing'],
  'prairie': ['grass', 'field', 'plains', 'meadow', 'savanna', 'open', 'flat'],
  'meadow': ['grass', 'field', 'plains', 'prairie', 'savanna', 'open'],
  'savanna': ['grass', 'plains', 'prairie', 'meadow', 'field', 'open'],
  
  // Tundra & Cold
  'cold': ['snow', 'ice', 'frozen', 'arctic', 'polar', 'winter', 'tundra'],
  'snow': ['cold', 'ice', 'frozen', 'arctic', 'polar', 'winter', 'tundra'],
  'ice': ['cold', 'snow', 'frozen', 'arctic', 'polar', 'winter', 'tundra'],
  'frozen': ['cold', 'snow', 'ice', 'arctic', 'polar', 'winter'],
  'arctic': ['cold', 'snow', 'ice', 'polar', 'frozen', 'winter'],
  'polar': ['cold', 'snow', 'ice', 'arctic', 'frozen', 'winter'],
  'winter': ['cold', 'snow', 'ice', 'arctic', 'polar', 'frozen'],
  'blizzard': ['cold', 'snow', 'winter', 'storm', 'wind'],
  
  // Desert & Dry
  'hot': ['desert', 'arid', 'dry', 'cactus', 'sun', 'sunny'],
  'dry': ['desert', 'hot', 'arid', 'cactus', 'sand'],
  'sand': ['desert', 'dry', 'beach', 'arid', 'dune'],
  'cactus': ['desert', 'hot', 'dry', 'arid'],
  'sunny': ['hot', 'dry', 'desert', 'arid', 'sun'],
  'sun': ['hot', 'sunny', 'desert', 'dry'],
  'arid': ['desert', 'hot', 'dry', 'cactus', 'scarc'],
};

/**
 * Calculate semantic similarity between two words using relationship mappings
 * Returns a score between 0 and 1
 */
export function calculateWordSimilarity(word1: string, word2: string, verbose = false): number {
  const lower1 = word1.toLowerCase();
  const lower2 = word2.toLowerCase();
  
  // Exact match
  if (lower1 === lower2) {
    if (verbose) console.log(`  ✅ "${lower1}" === "${lower2}" → 1.0`);
    return 1.0;
  }
  
  // Check if words are semantically related
  const related1 = SEMANTIC_RELATIONSHIPS[lower1] || [];
  const related2 = SEMANTIC_RELATIONSHIPS[lower2] || [];
  
  // Direct relationship
  if (related1.includes(lower2) || related2.includes(lower1)) {
    if (verbose) console.log(`  📚 "${lower1}" related to "${lower2}" → 0.8`);
    return 0.8;
  }
  
  // Check if they share related words (indirect relationship)
  const commonRelated = related1.filter(w => related2.includes(w));
  if (commonRelated.length > 0) {
    if (verbose) console.log(`  🔗 "${lower1}" indirectly related to "${lower2}" via [${commonRelated.join(', ')}] → 0.6`);
    return 0.6;
  }
  
  // Partial match (substring) - but only if words are meaningful length
  // Prevents false matches like "in" matching "marine"
  if ((lower1.length >= 4 && lower2.length >= 4) || 
      (lower1.length >= 4 && lower2.includes(lower1)) ||
      (lower2.length >= 4 && lower1.includes(lower2))) {
    if (verbose) console.log(`  ✂️  "${lower1}" contains "${lower2}" (or vice versa) → 0.4`);
    return 0.4;
  }
  
  if (verbose) console.log(`  ❌ "${lower1}" has no semantic relationship with "${lower2}" → 0.0`);
  return 0;
}

/**
 * Calculate semantic match score between user words and ecosystem keywords
 * Returns a score between 0 and 1
 */
export function calculateSemanticMatch(
  userWords: string[],
  ecosystemKeywords: string[],
  verbose = false
): number {
  let maxSimilarity = 0;
  let totalSimilarity = 0;
  let validMatches = 0;

  if (verbose) {
    console.log(`\n🔍 Comparing ${userWords.length} user words against ${ecosystemKeywords.length} keywords:`);
  }

  for (const userWord of userWords) {
    let bestMatch = { keyword: '', similarity: 0 };
    for (const keyword of ecosystemKeywords) {
      const similarity = calculateWordSimilarity(userWord, keyword, verbose);
      
      if (similarity > 0) {
        maxSimilarity = Math.max(maxSimilarity, similarity);
        totalSimilarity += similarity;
        validMatches++;
        
        if (similarity > bestMatch.similarity) {
          bestMatch = { keyword, similarity };
        }
      }
    }
    
    if (verbose && bestMatch.similarity > 0) {
      console.log(`  Best match for "${userWord}": "${bestMatch.keyword}" (${bestMatch.similarity})`);
    }
  }

  if (validMatches === 0) {
    if (verbose) console.log('  No semantic matches found');
    return 0;
  }

  // Return weighted average: 60% max, 40% average
  const avgSimilarity = totalSimilarity / validMatches;
  const finalScore = Math.max(maxSimilarity * 0.6 + avgSimilarity * 0.4, avgSimilarity);
  
  if (verbose) {
    console.log(`  Max similarity: ${maxSimilarity}, Avg similarity: ${avgSimilarity.toFixed(3)}`);
    console.log(`  Final score: ${finalScore.toFixed(3)} (60% max + 40% avg)`);
  }
  
  return finalScore;
}

/**
 * Extract unique words from a list
 */
export function extractWords(descriptors: string[]): string[] {
  return Array.from(new Set(descriptors.map(w => w.toLowerCase())));
}
