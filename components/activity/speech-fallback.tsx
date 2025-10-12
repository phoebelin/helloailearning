/**
 * Speech Fallback Component
 * Provides alternative input when speech recognition is unavailable
 */

'use client';

import React, { useState } from 'react';
import { Keyboard, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { isSpeechRecognitionSupported, getBrowserInfo } from '@/lib/utils/speech-utils';

export interface SpeechFallbackProps {
  /** Callback when text is submitted */
  onSubmit: (text: string) => void;
  /** Placeholder text for input */
  placeholder?: string;
  /** Button text */
  buttonText?: string;
  /** Whether to show the unsupported message */
  showMessage?: boolean;
  /** Custom className */
  className?: string;
  /** Minimum characters required */
  minLength?: number;
  /** Maximum characters allowed */
  maxLength?: number;
}

/**
 * Text input fallback for speech recognition
 * Shown when Web Speech API is not supported
 */
export function SpeechFallback({
  onSubmit,
  placeholder = 'Type your answer here...',
  buttonText = 'Submit',
  showMessage = true,
  className,
  minLength = 3,
  maxLength = 500,
}: SpeechFallbackProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);

    const trimmedText = text.trim();

    if (trimmedText.length === 0) {
      setError('Please enter some text.');
      return;
    }

    if (trimmedText.length < minLength) {
      setError(`Please enter at least ${minLength} characters.`);
      return;
    }

    if (trimmedText.length > maxLength) {
      setError(`Please keep your answer under ${maxLength} characters.`);
      return;
    }

    onSubmit(trimmedText);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const characterCount = text.length;
  const isValid = characterCount >= minLength && characterCount <= maxLength;

  return (
    <div className={cn('space-y-3', className)}>
      {showMessage && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20 p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Speech recognition is not available
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                You can type your answers instead. The activity works the same way!
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2">
          <div className="relative">
            <Input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              maxLength={maxLength}
              className={cn(
                'pr-12',
                error && 'border-destructive focus-visible:ring-destructive'
              )}
              aria-invalid={!!error}
              aria-describedby={error ? 'input-error' : undefined}
            />
            <Keyboard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {characterCount < minLength ? (
                <span className="text-yellow-600 dark:text-yellow-400">
                  {minLength - characterCount} more character{minLength - characterCount !== 1 ? 's' : ''} needed
                </span>
              ) : (
                <span className="text-green-600 dark:text-green-400">
                  ✓ Ready to submit
                </span>
              )}
            </span>
            <span className={cn(
              characterCount > maxLength * 0.9 && 'text-yellow-600 dark:text-yellow-400',
              characterCount >= maxLength && 'text-destructive'
            )}>
              {characterCount} / {maxLength}
            </span>
          </div>
        </div>

        {error && (
          <p id="input-error" className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={!isValid || text.trim().length === 0}
          className="w-full"
        >
          {buttonText}
        </Button>
      </form>
    </div>
  );
}

/**
 * Alert component showing speech recognition unavailability
 * with browser-specific recommendations
 */
export function SpeechUnavailableAlert({ className }: { className?: string }) {
  const browserInfo = getBrowserInfo();
  const isSupported = isSpeechRecognitionSupported();

  if (isSupported) return null;

  return (
    <div className={cn('rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/20 p-4', className)}>
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-2 text-sm">
          <p className="font-medium text-yellow-900 dark:text-yellow-100">
            Speech recognition is not available
          </p>
          <p className="text-yellow-700 dark:text-yellow-300">
            Your browser ({browserInfo.name}) doesn't support speech recognition, or you're not using a secure connection (HTTPS).
          </p>
          
          <div className="mt-3 space-y-1">
            <p className="font-medium text-yellow-900 dark:text-yellow-100">
              To use speech features:
            </p>
            <ul className="list-disc list-inside space-y-1 text-yellow-700 dark:text-yellow-300 ml-2">
              <li>Use Chrome, Edge, or Safari browser</li>
              <li>Make sure you're on a secure HTTPS connection</li>
              <li>Check that your device has a microphone</li>
            </ul>
          </div>

          <p className="text-yellow-700 dark:text-yellow-300 mt-3">
            <strong>Don't worry!</strong> You can complete this activity by typing your answers instead.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline fallback toggle - switches between speech and text input
 */
export function SpeechInputWithFallback({
  onTextSubmit,
  speechComponent,
  placeholder = 'Type your answer...',
  className,
}: {
  onTextSubmit: (text: string) => void;
  speechComponent: React.ReactNode;
  placeholder?: string;
  className?: string;
}) {
  const [useTextInput, setUseTextInput] = useState(false);
  const isSupported = isSpeechRecognitionSupported();

  // Auto-enable text input if speech not supported
  const shouldUseTextInput = !isSupported || useTextInput;

  return (
    <div className={cn('space-y-3', className)}>
      {isSupported && !useTextInput ? (
        <>
          {speechComponent}
          
          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setUseTextInput(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Keyboard className="h-4 w-4 mr-2" />
              Prefer to type instead?
            </Button>
          </div>
        </>
      ) : (
        <>
          <SpeechFallback
            onSubmit={onTextSubmit}
            placeholder={placeholder}
            showMessage={!isSupported}
          />
          
          {isSupported && useTextInput && (
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setUseTextInput(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                Switch back to speech
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Compact inline fallback notice
 */
export function InlineSpeechFallbackNotice({ className }: { className?: string }) {
  const isSupported = isSpeechRecognitionSupported();

  if (isSupported) return null;

  return (
    <p className={cn('text-sm text-muted-foreground flex items-center gap-2', className)}>
      <Info className="h-4 w-4" />
      Speech recognition unavailable. Please type your answers.
    </p>
  );
}

/**
 * Banner showing speech unavailability at top of page
 */
export function SpeechUnavailableBanner({ 
  onDismiss,
  className 
}: { 
  onDismiss?: () => void;
  className?: string;
}) {
  const [isDismissed, setIsDismissed] = useState(false);
  const isSupported = isSpeechRecognitionSupported();

  if (isSupported || isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <div className={cn('bg-yellow-50 dark:bg-yellow-950/20 border-b border-yellow-200 dark:border-yellow-900', className)}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <p className="text-sm text-yellow-900 dark:text-yellow-100">
              <strong>Speech recognition is unavailable.</strong> You can complete this activity by typing your answers instead.
            </p>
          </div>
          
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-yellow-900 dark:text-yellow-100 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 flex-shrink-0"
            >
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

