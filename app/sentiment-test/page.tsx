/**
 * Sentiment Analysis Test Page
 * Quick test to verify BERT sentiment analysis is working
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ecosystemPredictorDemo } from '@/lib/ml/ecosystem-predictor-demo';
import { ProbabilityChart } from '@/components/activity/probability-chart';
import { PredictionResult } from '@/types/activity';

export default function SentimentTestPage() {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testSentences, setTestSentences] = useState([
    'Bees don\'t like water',
    'Bees avoid swimming',
    'Bees prefer dry environments'
  ]);

  useEffect(() => {
    const initializePredictor = async () => {
      try {
        await ecosystemPredictorDemo.initialize();
        console.log('BERT predictor initialized');
      } catch (error) {
        console.warn('Failed to initialize BERT predictor:', error);
      }
    };
    
    initializePredictor();
  }, []);

  const runTest = async () => {
    setIsLoading(true);
    try {
      const result = await ecosystemPredictorDemo.predictEcosystem(testSentences, 'bees');
      
      const predictionResult: PredictionResult = {
        ecosystems: result.ecosystems,
        topPrediction: result.topPrediction,
        confidence: result.confidence,
        reasoning: result.reasoning,
      };
      
      setPrediction(predictionResult);
      console.log('Sentiment analysis result:', result);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Sentiment Analysis Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Sentences</h2>
          <div className="space-y-2 mb-4">
            {testSentences.map((sentence, index) => (
              <div key={index} className="p-3 bg-gray-100 rounded">
                <span className="font-medium">{index + 1}.</span> {sentence}
              </div>
            ))}
          </div>
          
          <button
            onClick={runTest}
            disabled={isLoading}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Running Test...' : 'Test Sentiment Analysis'}
          </button>
        </div>

        {prediction && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Prediction Results</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Top Prediction</h3>
              <p className="text-lg">
                <span className="font-semibold">{prediction.topPrediction}</span> 
                <span className="text-gray-600 ml-2">({Math.round(prediction.confidence * 100)}% confidence)</span>
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Probability Chart</h3>
              <ProbabilityChart
                prediction={prediction}
                onBarHover={(ecosystem) => {
                  console.log('Hovered over:', ecosystem);
                }}
              />
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Reasoning</h3>
              <ul className="list-disc list-inside space-y-1">
                {prediction.reasoning.map((reason, index) => (
                  <li key={index} className="text-gray-700">{reason}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Detailed Results</h3>
              <div className="space-y-2">
                {prediction.ecosystems.map((eco) => (
                  <div key={eco.ecosystem} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium capitalize">{eco.ecosystem}</span>
                    <span className="text-blue-600 font-semibold">
                      {Math.round(eco.probability * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Expected Behavior</h3>
          <p className="text-yellow-700">
            With sentiment analysis, sentences like "Bees don't like water" should <strong>reduce</strong> 
            the probability for the ocean ecosystem, even though "water" is mentioned. 
            Check the browser console for detailed sentiment analysis logs.
          </p>
        </div>
      </div>
    </div>
  );
}
