/**
 * Enhanced Prediction Step with BERT-based Ecosystem Prediction
 * Uses semantic similarity instead of simple keyword matching
 */

import React, { useState, useEffect, useRef } from 'react';
import { useEnhancedTextToSpeech } from '@/hooks/use-enhanced-text-to-speech';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ActivityContext } from '@/lib/context/activity-context';
import { ProbabilityChart } from '@/components/activity/probability-chart';
import { AnimalType, EcosystemType } from '@/types/activity';
import { ecosystemPredictor, EmbeddingPredictionResult } from '@/lib/ml/ecosystem-predictor-bert';

interface PredictionStepProps {
  selectedAnimal: AnimalType;
  userSentences: string[];
  onNext: () => void;
  onPrevious?: () => void;
}

export function PredictionStep({ selectedAnimal, userSentences, onNext, onPrevious }: PredictionStepProps) {
  const [isListening, setIsListening] = useState(false);
  const [zhoraiResponse, setZhoraiResponse] = useState<string>('');
  const [showChart, setShowChart] = useState(false);
  const [predictionResult, setPredictionResult] = useState<EmbeddingPredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modelStatus, setModelStatus] = useState<{ initialized: boolean; modelName: string }>({ initialized: false, modelName: 'none' });
  
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { speak, isSpeaking } = useEnhancedTextToSpeech({
    rate: 0.9,
    pitch: 1.1,
    useGoogleCloud: true,
  });

  const { startListening, stopListening, transcript, isListening: speechIsListening } = useSpeechRecognition({
    onResult: (result) => {
      console.log('Speech recognition result:', result);
    },
    onError: (error) => {
      console.error('Speech recognition error:', error);
      setIsListening(false);
    },
  });

  // Initialize BERT model on component mount
  useEffect(() => {
    const initializeModel = async () => {
      try {
        await ecosystemPredictor.initialize();
        setModelStatus(ecosystemPredictor.getModelStatus());
      } catch (error) {
        console.error('Failed to initialize BERT model:', error);
      }
    };

    initializeModel();
  }, []);

  const handleSpeechInput = async () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
      
      // Process the transcript
      if (transcript.trim()) {
        await processUserQuestion(transcript);
      }
    } else {
      setIsListening(true);
      startListening();
    }
  };

  const processUserQuestion = async (question: string) => {
    setIsLoading(true);
    
    try {
      // Generate prediction using BERT embeddings
      const result = await ecosystemPredictor.predictEcosystem([...userSentences, question], selectedAnimal);
      setPredictionResult(result);
      setShowChart(true);

      // Generate Zhorai's response based on confidence
      const confidence = result.confidence;
      let responseText = '';
      
      if (confidence > 0.7) {
        responseText = `I'm pretty sure ${selectedAnimal} live in the ${result.topPrediction}!`;
      } else if (confidence > 0.4) {
        responseText = `I think ${selectedAnimal} live in the ${result.topPrediction}.`;
      } else {
        responseText = `Maybe ${selectedAnimal} live in the ${result.topPrediction}?`;
      }

      setZhoraiResponse(responseText);

      // Speak Zhorai's response
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }

      speechTimeoutRef.current = setTimeout(() => {
        if (!isSpeaking) {
          speak(responseText, {
            onError: (error) => {
              if (error !== 'canceled') {
                console.warn('Speech synthesis error:', error);
              }
            }
          });
        }
        speechTimeoutRef.current = null;
      }, 500);

    } catch (error) {
      console.error('Error processing prediction:', error);
      setZhoraiResponse('Sorry, I had trouble understanding that. Could you try again?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBarHover = (ecosystem: EcosystemType, prediction: any) => {
    console.log(`Hovered over ${ecosystem}:`, prediction);
  };

  const handleBarLeave = () => {
    console.log('Left bar hover');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Based on what you&apos;ve taught Zhorai, do you think Zhorai can guess where a {selectedAnimal} lives? Try asking!
        </h1>
        
        {/* Model Status Indicator */}
        <div className="mb-4 p-2 bg-gray-100 rounded-lg inline-block">
          <span className="text-sm text-gray-600">
            AI Model: {modelStatus.initialized ? '✅ BERT Loaded' : '⏳ Loading...'}
          </span>
        </div>

        <Button
          onClick={handleSpeechInput}
          disabled={isLoading}
          className={`px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-black hover:bg-gray-800 text-white'
          }`}
        >
          {isListening ? '🛑 Stop Listening' : '🎤 Press and Speak'}
        </Button>

        {transcript && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 font-medium">You said: &quot;{transcript}&quot;</p>
          </div>
        )}

        <div className="mt-6">
          <p className="text-purple-600 font-medium text-lg">
            Example: &quot;Where do {selectedAnimal} live?&quot;
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Zhorai Character */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative w-[200px] h-[220px]">
            <Image
              src="/images/zhorai.png"
              alt="Zhorai"
              width={200}
              height={220}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Prediction Chart */}
        <div className="flex flex-col items-center">
          {showChart && predictionResult && (
            <div className="w-full">
              <div className="mb-4 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Zhorai&apos;s Prediction
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Hover over the bars to see what sentences I learned that correspond with each ecosystem
                </p>
                
                {/* Method Indicator */}
                <div className="mb-4 p-2 bg-blue-50 rounded-lg">
                  <span className="text-sm text-blue-800">
                    Method: {predictionResult.method === 'bert' ? '🧠 BERT Semantic Analysis' : 
                             predictionResult.method === 'hybrid' ? '🔀 Hybrid (BERT + Keywords)' : 
                             '📝 Keyword Matching'}
                  </span>
                </div>
              </div>

              <ProbabilityChart
                data={predictionResult}
                width={500}
                height={300}
                animated={true}
                onBarHover={handleBarHover}
                onBarLeave={handleBarLeave}
                className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
              />

              {zhoraiResponse && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <p className="text-green-800 font-medium text-lg">
                    Zhorai: &quot;{zhoraiResponse}&quot;
                  </p>
                </div>
              )}

              {/* Debug Information */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs">
                  <h4 className="font-semibold mb-2">Debug Info:</h4>
                  <p>Method: {predictionResult.method}</p>
                  <p>Top Prediction: {predictionResult.topPrediction} ({Math.round(predictionResult.confidence * 100)}%)</p>
                  <p>BERT Similarities: {JSON.stringify(predictionResult.embeddingSimilarities, null, 2)}</p>
                  <p>Keyword Matches: {JSON.stringify(predictionResult.keywordMatches, null, 2)}</p>
                </div>
              )}
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-2 text-gray-600">Analyzing with AI...</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-12">
        {onPrevious && (
          <Button
            onClick={onPrevious}
            variant="outline"
            className="px-6 py-3"
          >
            ← Previous
          </Button>
        )}
        
        <Button
          onClick={onNext}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
        >
          Continue →
        </Button>
      </div>
    </div>
  );
}
