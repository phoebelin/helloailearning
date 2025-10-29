# Word Embeddings for Semantic Similarity - Implementation Options

## Current State
Currently using pre-computed word relationship dictionary for semantic similarity.

## Option 1: @xenova/transformers with Sentence Encoder ⭐ RECOMMENDED

### Implementation
```typescript
// lib/ml/word-embeddings-xenova.ts
import { pipeline, Pipeline } from '@xenova/transformers';

class WordEmbeddingsXenova {
  private model: Pipeline | null = null;

  async initialize() {
    if (this.model) return;
    
    // Use all-MiniLM-L6-v2 for semantic similarity (22MB)
    this.model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }

  async getEmbedding(text: string): Promise<number[]> {
    await this.initialize();
    const output = await this.model(text);
    return output.data; // Returns vector of 384 dimensions
  }

  async calculateSimilarity(text1: string, text2: string): Promise<number> {
    const embedding1 = await this.getEmbedding(text1);
    const embedding2 = await this.getEmbedding(text2);
    
    // Cosine similarity
    return this.cosineSimilarity(embedding1, embedding2);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

export const wordEmbeddingsXenova = new WordEmbeddingsXenova();
```

### Usage in Ecosystem Predictor
```typescript
// Instead of calculateSemanticMatch from semantic-similarity.ts
const similarity = await wordEmbeddingsXenova.calculateSimilarity(
  "monkeys live in trees",
  "rainforest canopy tropical"
);
```

### Pros
- ✅ Already have @xenova/transformers installed
- ✅ Browser-friendly, runs entirely client-side
- ✅ Sentence-level understanding (context-aware)
- ✅ Pre-trained model, high accuracy
- ✅ Small model size (~22MB)

### Cons
- ⚠️ First load: ~2-5 seconds to download model
- ⚠️ Per-inference latency: ~50-200ms per text (can batch)

---

## Option 2: Browser GloVe with spaCy-style word vectors

### Implementation
```typescript
// lib/ml/word-embeddings-glove.ts
// Use glovejs npm package or pre-trained GloVe vectors

import { GloVe } from 'glovejs'; // Need to add: npm install glovejs

class WordEmbeddingsGlove {
  private model: GloVe | null = null;
  private embeddings: Map<string, number[]> = new Map();

  async initialize() {
    // Load pre-trained GloVe vectors (50-200 dimensions)
    this.model = new GloVe({
      vectors: '/models/glove.6B.50d.txt', // ~50MB file
      dimensions: 50
    });
    await this.model.load();
  }

  getEmbedding(word: string): number[] | null {
    return this.model.getVector(word.toLowerCase());
  }

  async calculateSimilarity(word1: string, word2: string): Promise<number> {
    const embedding1 = this.getEmbedding(word1);
    const embedding2 = this.getEmbedding(word2);
    
    if (!embedding1 || !embedding2) return 0;
    
    return this.cosineSimilarity(embedding1, embedding2);
  }

  // Average word embeddings for phrases
  async getPhraseEmbedding(words: string[]): Promise<number[]> {
    const embeddings = words.map(w => this.getEmbedding(w)).filter(e => e);
    return this.averageEmbeddings(embeddings as number[][]);
  }

  private averageEmbeddings(embeddings: number[][]): number[] {
    const dim = embeddings[0].length;
    const result = new Array(dim).fill(0);
    
    for (const emb of embeddings) {
      for (let i = 0; i < dim; i++) {
        result[i] += emb[i];
      }
    }
    
    return result.map(sum => sum / embeddings.length);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

export const wordEmbeddingsGlove = new WordEmbeddingsGlove();
```

### Pros
- ✅ Pure word-level embeddings
- ✅ Fast lookups (O(1) dictionary lookup)
- ✅ No inference needed
- ✅ Standard approach in NLP

### Cons
- ❌ Need to install `glovejs` npm package
- ❌ Need to download GloVe vectors file (50-200MB)
- ❌ Word-level only (no sentence context)
- ❌ Out-of-vocabulary words return null

---

## Option 3: TensorFlow.js Universal Sentence Encoder

### Implementation
```typescript
// lib/ml/word-embeddings-use.ts
import * as use from '@tensorflow-models/universal-sentence-encoder';

class WordEmbeddingsUSE {
  private model: use.UniversalSentenceEncoder | null = null;

  async initialize() {
    if (this.model) return;
    
    // Load Universal Sentence Encoder (lightweight, ~17MB)
    this.model = await use.load();
  }

  async getEmbedding(text: string): Promise<Float32Array> {
    await this.initialize();
    const embeddings = await this.model.embed([text]);
    return await embeddings.data();
  }

  async calculateSimilarity(text1: string, text2: string): Promise<number> {
    await this.initialize();
    
    const embeddings = await this.model.embed([text1, text2]);
    const emb1 = embeddings.slice([0, 0], [1, -1]);
    const emb2 = embeddings.slice([1, 0], [1, -1]);
    
    // Cosine similarity using TensorFlow.js ops
    const normalized1 = emb1.normalize2D().expandDims(1);
    const normalized2 = emb2.normalize2D().expandDims(0);
    
    const score = normalized1.matMul(normalized2).dataSync()[0];
    return score;
  }
}

export const wordEmbeddingsUSE = new WordEmbeddingsUSE();
```

### Installation
```bash
npm install @tensorflow-models/universal-sentence-encoder @tensorflow/tfjs
```

### Pros
- ✅ Specifically designed for sentence similarity
- ✅ 512-dimensional embeddings (very rich)
- ✅ Browser-optimized
- ✅ Pre-trained on Wikipedia and web text

### Cons
- ⚠️ Need to add TensorFlow.js (~500KB gzipped)
- ⚠️ Larger bundle size than @xenova/transformers
- ⚠️ TensorFlow.js API is more verbose
- ⚠️ Heavier than @xenova/transformers

---

## Recommendation: Option 1 (@xenova/transformers)

### Why?
1. Already have it installed
2. Best balance of accuracy and performance
3. Sentence-level understanding (better than word-level)
4. Modern architecture (Hugging Face Transformers)
5. Easy to integrate into existing code

### Migration Path
```typescript
// lib/ml/ecosystem-predictor-demo.ts

// Replace this:
import { calculateSemanticMatch } from './semantic-similarity';

// With this:
import { wordEmbeddingsXenova } from './word-embeddings-xenova';

// Replace:
const semanticScore = calculateSemanticMatch(userWords, keywords);
// With:
const semanticScore = await wordEmbeddingsXenova.calculateSimilarity(
  userText,
  keywords.join(' ')
);
```

### Performance Impact
- First call: ~2-5 seconds (model download)
- Subsequent calls: ~50-200ms per similarity calculation
- Can batch multiple similarity calculations for efficiency

### Bundle Size Impact
- Model: ~22MB (lazy-loaded, cached)
- Library: Already in dependencies

---

## Quick Start (Option 1)

Create `lib/ml/word-embeddings-xenova.ts` with the code from Option 1 above, then update `ecosystem-predictor-demo.ts` to use it for semantic similarity instead of the dictionary-based approach.

