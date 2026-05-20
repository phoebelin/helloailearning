/**
 * BERT vs Keyword Matching Demo Page
 * Shows the difference between semantic similarity and keyword matching
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ProbabilityChart } from '@/components/activity/probability-chart';
import { ecosystemPredictorDemo, EmbeddingPredictionResult } from '@/lib/ml/ecosystem-predictor-demo';
import { AnimalType } from '@/types/activity';

const DEMO_SENTENCES = [
  {
    animal: 'bees' as AnimalType,
    sentences: [
      'Bees live in tall trees and collect nectar from flowers',
      'Bees build hives in dense vegetation',
      'Bees thrive in warm, humid environments'
    ],
    description: 'Complex rainforest description with semantic context'
  },
  {
    animal: 'dolphins' as AnimalType,
    sentences: [
      'Dolphins swim in the deep ocean',
      'Dolphins eat fish from the water',
      'Dolphins live in the marine environment'
    ],
    description: 'Clear ocean habitat with marine terminology'
  },
  {
    animal: 'camels' as AnimalType,
    sentences: [
      'Camels live in hot deserts',
      'Deserts have very little moisture',
      'It is extremely dry and arid'
    ],
    description: 'Desert habitat with temperature and moisture context'
  },
  {
    animal: 'zebras' as AnimalType,
    sentences: [
      'Zebras graze on grass',
      'Grasslands have open fields',
      'Animals eat grass in the prairie'
    ],
    description: 'Grassland habitat with grazing behavior'
  },
  {
    animal: 'polar bears' as AnimalType,
    sentences: [
      'Polar bears live in cold places',
      'The tundra is covered in snow',
      'Arctic animals survive in freezing temperatures'
    ],
    description: 'Tundra habitat with cold climate context'
  },
  {
    animal: 'bees' as AnimalType,
    sentences: [
      'Bees avoid water and prefer dry areas',
      'Bees don\'t like swimming',
      'Bees thrive in warm climates without moisture'
    ],
    description: 'Negative context - bees avoiding water (should NOT predict ocean)'
  },
  {
    animal: 'bees' as AnimalType,
    sentences: [
      'Bees don\'t like water',
      'Bees avoid swimming',
      'Bees prefer dry environments'
    ],
    description: 'Strong negative sentiment - water should reduce ocean prediction'
  },
  {
    animal: 'fish' as AnimalType,
    sentences: [
      'Fish love water',
      'Fish thrive in aquatic environments',
      'Fish need water to survive'
    ],
    description: 'Positive sentiment - water should boost ocean prediction'
  }
];

export default function BERTDemoPage() {
  const [currentDemo, setCurrentDemo] = useState(0);
  const [bertResult, setBertResult] = useState<EmbeddingPredictionResult | null>(null);
  const [keywordResult, setKeywordResult] = useState<EmbeddingPredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modelStatus, setModelStatus] = useState<{ initialized: boolean; modelName: string }>({ initialized: false, modelName: 'none' });

  const demo = DEMO_SENTENCES[currentDemo];

  useEffect(() => {
    const initializeModel = async () => {
      try {
        await ecosystemPredictorDemo.initialize();
        setModelStatus(ecosystemPredictorDemo.getModelStatus());
      } catch (error) {
        console.error('Failed to initialize demo model:', error);
      }
    };

    initializeModel();
  }, []);

  const runComparison = async () => {
    setIsLoading(true);
    
    try {
      const comparison = await ecosystemPredictorDemo.compareMethods(
        demo.sentences,
        demo.animal
      );
      
      setBertResult(comparison.bert);
      setKeywordResult(comparison.keyword);
    } catch (error) {
      console.error('Error running comparison:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextDemo = () => {
    setCurrentDemo((prev) => (prev + 1) % DEMO_SENTENCES.length);
    setBertResult(null);
    setKeywordResult(null);
  };

  const prevDemo = () => {
    setCurrentDemo((prev) => (prev - 1 + DEMO_SENTENCES.length) % DEMO_SENTENCES.length);
    setBertResult(null);
    setKeywordResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧠 BERT vs Keyword Matching Demo
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            See how semantic similarity using BERT embeddings compares to simple keyword matching
          </p>
          
          {/* Model Status */}
          <div className="mb-6 p-3 bg-blue-50 rounded-lg inline-block">
            <span className="text-blue-800 font-medium">
              {modelStatus.initialized ? '✅ BERT Model Ready' : '⏳ Loading...'}
            </span>
          </div>
        </div>

        {/* Demo Selection */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Button onClick={prevDemo} variant="outline">
              ← Previous Demo
            </Button>
            <span className="text-sm text-gray-500">
              Demo {currentDemo + 1} of {DEMO_SENTENCES.length}
            </span>
            <Button onClick={nextDemo} variant="outline">
              Next Demo →
            </Button>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {demo.animal.charAt(0).toUpperCase() + demo.animal.slice(1)} Example
            </h2>
            <p className="text-gray-600 mb-4">{demo.description}</p>
            
            <div className="space-y-2">
              {demo.sentences.map((sentence, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                  <span className="font-medium text-gray-700">&quot;{sentence}&quot;</span>
                </div>
              ))}
            </div>

            <Button 
              onClick={runComparison} 
              disabled={isLoading}
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isLoading ? '🔄 Analyzing...' : '🚀 Run Comparison'}
            </Button>
          </div>
        </div>

        {/* Results Comparison */}
        {(bertResult || keywordResult) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* BERT Results */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-2">🧠</span>
                <h3 className="text-xl font-semibold text-gray-800">BERT Semantic Analysis</h3>
              </div>
              
              {bertResult && (
                <>
                  <div className="mb-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-green-800 font-medium">
                      Top Prediction: <span className="font-bold">{bertResult.topPrediction}</span> 
                      ({Math.round(bertResult.confidence * 100)}% confidence)
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      Method: {bertResult.method}
                    </p>
                  </div>

                  <ProbabilityChart
                    data={bertResult}
                    width={400}
                    height={250}
                    animated={true}
                    className="mb-4"
                  />

                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">Semantic Similarities:</p>
                    <div className="space-y-1">
                      {Object.entries(bertResult.embeddingSimilarities).map(([ecosystem, similarity]) => (
                        <div key={ecosystem} className="flex justify-between">
                          <span className="capitalize">{ecosystem}:</span>
                          <span className="font-mono">{(similarity * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Sentiment Analysis Details */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium text-blue-800 mb-2">🎭 Sentiment Analysis:</p>
                      <div className="text-xs text-blue-700">
                        <p>Check browser console for detailed sentiment breakdown</p>
                        <p>Look for 🚫 (negative), ✅ (positive), ⚪ (neutral) indicators</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Keyword Results */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-2">📝</span>
                <h3 className="text-xl font-semibold text-gray-800">Keyword Matching</h3>
              </div>
              
              {keywordResult && (
                <>
                  <div className="mb-4 p-3 bg-orange-50 rounded-lg">
                    <p className="text-orange-800 font-medium">
                      Top Prediction: <span className="font-bold">{keywordResult.topPrediction}</span> 
                      ({Math.round(keywordResult.confidence * 100)}% confidence)
                    </p>
                    <p className="text-sm text-orange-600 mt-1">
                      Method: {keywordResult.method}
                    </p>
                  </div>

                  <ProbabilityChart
                    data={keywordResult}
                    width={400}
                    height={250}
                    animated={true}
                    className="mb-4"
                  />

                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">Keyword Matches:</p>
                    <div className="space-y-1">
                      {Object.entries(keywordResult.keywordMatches).map(([ecosystem, matches]) => (
                        <div key={ecosystem} className="flex justify-between">
                          <span className="capitalize">{ecosystem}:</span>
                          <span className="font-mono">{matches} matches</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Key Differences */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">🔍 Key Differences</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-700 mb-2">✅ BERT Advantages</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Understands semantic meaning, not just keywords</li>
                <li>• Handles synonyms and related concepts</li>
                <li>• Recognizes context and relationships</li>
                <li>• Better with complex, nuanced sentences</li>
                <li>• <strong>Handles negation (&quot;don&apos;t like water&quot;)</strong></li>
                <li>• <strong>Analyzes sentiment (positive/negative)</strong></li>
                <li>• <strong>Reduces scores for negated concepts</strong></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-orange-700 mb-2">⚠️ Keyword Limitations</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Only matches exact word occurrences</li>
                <li>• Misses synonyms and related terms</li>
                <li>• No understanding of context</li>
                <li>• Struggles with complex sentences</li>
                <li>• <strong>Can&apos;t handle negation properly</strong></li>
                <li>• <strong>Ignores sentiment (&quot;don&apos;t like&quot; = same as &quot;like&quot;)</strong></li>
                <li>• <strong>Counts negated words as positive evidence</strong></li>
              </ul>
            </div>
          </div>
          
          {/* Sentiment Analysis Highlight */}
          <div className="mt-6 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <h4 className="font-semibold text-purple-800 mb-2">🎭 Sentiment Analysis Feature</h4>
            <div className="text-sm text-purple-700">
              <p className="mb-2"><strong>Example:</strong> &quot;Bees don&apos;t like water&quot;</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">❌ Without Sentiment:</p>
                  <p>• &quot;water&quot; keyword found → Ocean gets +1 point</p>
                  <p>• Incorrectly predicts ocean habitat</p>
                </div>
                <div>
                  <p className="font-medium">✅ With Sentiment:</p>
                  <p>• &quot;don&apos;t like water&quot; detected → Ocean gets -1 point</p>
                  <p>• Correctly avoids ocean prediction</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-8 bg-gray-900 text-white rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">⚙️ Technical Implementation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-blue-300 mb-2">BERT Model Details</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• Model: Xenova/all-MiniLM-L6-v2</li>
                <li>• Size: ~22MB (quantized)</li>
                <li>• Dimensions: 384</li>
                <li>• Load time: 2-5 seconds</li>
                <li>• Inference: 50-200ms per sentence</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-green-300 mb-2">Implementation Features</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• Cosine similarity calculation</li>
                <li>• Automatic fallback to keywords</li>
                <li>• Hybrid approach (BERT + keywords)</li>
                <li>• Browser-compatible</li>
                <li>• Real-time predictions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
