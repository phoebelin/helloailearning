/**
 * AudioRecorder Component
 * Reusable speech-to-text component with microphone button, animations, and transcript display
 */

'use client';

import React, { useEffect } from 'react';
import { Mic, MicOff, StopCircle } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface AudioRecorderProps {
  /** Callback when transcript is updated */
  onTranscriptChange?: (transcript: string, isFinal: boolean) => void;
  /** Callback when recording starts */
  onStart?: () => void;
  /** Callback when recording stops */
  onStop?: () => void;
  /** Callback when an error occurs */
  onError?: (error: string) => void;
  /** Whether to show the transcript display */
  showTranscript?: boolean;
  /** Placeholder text when no transcript */
  placeholder?: string;
  /** Custom button text when not recording */
  buttonText?: string;
  /** Custom button text when recording */
  recordingText?: string;
  /** Whether to use continuous recording mode */
  continuous?: boolean;
  /** Whether to show interim results */
  interimResults?: boolean;
  /** Language for speech recognition */
  lang?: string;
  /** Button variant style */
  variant?: 'default' | 'outline' | 'secondary';
  /** Button size */
  size?: 'default' | 'sm' | 'lg';
  /** Additional className for container */
  className?: string;
  /** Additional className for button */
  buttonClassName?: string;
  /** Whether to auto-stop after receiving final result */
  autoStop?: boolean;
  /** Whether the button is disabled */
  disabled?: boolean;
}

/**
 * AudioRecorder component for speech-to-text input
 * 
 * @example
 * ```tsx
 * <AudioRecorder
 *   showTranscript
 *   placeholder="Press and speak..."
 *   onTranscriptChange={(text, isFinal) => {
 *     if (isFinal) {
 *       console.log('Final transcript:', text);
 *     }
 *   }}
 * />
 * ```
 */
export function AudioRecorder({
  onTranscriptChange,
  onStart,
  onStop,
  onError,
  showTranscript = true,
  placeholder = 'Press the microphone and speak...',
  buttonText = 'Press to speak',
  recordingText = 'Listening...',
  continuous = false,
  interimResults = true,
  lang = 'en-US',
  variant = 'default',
  size = 'default',
  className,
  buttonClassName,
  autoStop = false,
  disabled = false,
}: AudioRecorderProps) {
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    continuous,
    interimResults,
    lang,
    onResult: (result) => {
      // Auto-stop if enabled and we received a final result
      if (autoStop && result.isFinal && !continuous) {
        stopListening();
      }
    },
    onError: (errorMsg) => {
      if (onError) {
        onError(errorMsg);
      }
    },
  });

  // Use refs for callbacks to avoid unnecessary re-renders
  const onTranscriptChangeRef = React.useRef(onTranscriptChange);
  const onStartRef = React.useRef(onStart);
  const onStopRef = React.useRef(onStop);

  React.useEffect(() => {
    onTranscriptChangeRef.current = onTranscriptChange;
  }, [onTranscriptChange]);

  React.useEffect(() => {
    onStartRef.current = onStart;
  }, [onStart]);

  React.useEffect(() => {
    onStopRef.current = onStop;
  }, [onStop]);

  // Notify parent of transcript changes
  useEffect(() => {
    if (onTranscriptChangeRef.current) {
      const fullTranscript = transcript + (interimTranscript ? ' ' + interimTranscript : '');
      onTranscriptChangeRef.current(fullTranscript, interimTranscript === '');
    }
  }, [transcript, interimTranscript]);

  // Notify parent when recording state changes
  const prevIsListeningRef = React.useRef(isListening);
  useEffect(() => {
    // Only trigger callbacks on actual state changes
    if (isListening && !prevIsListeningRef.current && onStartRef.current) {
      onStartRef.current();
    } else if (!isListening && prevIsListeningRef.current && onStopRef.current) {
      onStopRef.current();
    }
    prevIsListeningRef.current = isListening;
  }, [isListening]);

  const handleToggleRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  // Show error state if not supported
  if (!isSupported) {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <div className="flex items-start gap-3">
            <MicOff className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-destructive">
                Speech recognition not supported
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Please use Chrome, Edge, or Safari for speech recognition features.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayTranscript = transcript + (interimTranscript ? ' ' + interimTranscript : '');
  const hasTranscript = displayTranscript.trim().length > 0;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Microphone Button and Waveform */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant={variant}
          size={size}
          onClick={handleToggleRecording}
          className={cn("relative transition-all duration-200", buttonClassName)}
          aria-label={isListening ? 'Stop recording' : 'Start recording'}
        >
          {/* Pulsing ring animation when listening */}
          {isListening && (
            <span className="absolute -inset-1 rounded-md bg-current opacity-20 animate-ping" />
          )}
          
          {/* Icon */}
          {isListening ? (
            <StopCircle className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
          
          {/* Button text */}
          <span>{isListening ? recordingText : buttonText}</span>
        </Button>

        {/* Small waveform indicator when listening */}
        {isListening && (
          <div className="flex items-center gap-1 h-6 bg-muted/30 rounded px-2">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-0.5 bg-primary rounded-full transition-all duration-150',
                  'animate-wave'
                )}
                style={{
                  height: '4px',
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Transcript Display */}
      {showTranscript && (
        <div
          className={cn(
            'min-h-[80px] rounded-lg border bg-background p-4 transition-all duration-200',
            isListening && 'border-primary shadow-sm',
            hasTranscript ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {hasTranscript ? (
            <div className="space-y-2">
              {/* Final transcript */}
              {transcript && (
                <p className="text-sm leading-relaxed">{transcript}</p>
              )}
              
              {/* Interim transcript (lighter/italic) */}
              {interimTranscript && (
                <p className="text-sm leading-relaxed italic text-muted-foreground">
                  {interimTranscript}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm">{placeholder}</p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compact version of AudioRecorder with icon button only
 */
export function AudioRecorderCompact({
  onTranscriptChange,
  onError,
  className,
  ...props
}: Omit<AudioRecorderProps, 'showTranscript' | 'buttonText' | 'recordingText'>) {
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    continuous: props.continuous ?? false,
    interimResults: props.interimResults ?? true,
    lang: props.lang ?? 'en-US',
    onError: (errorMsg) => {
      if (onError) {
        onError(errorMsg);
      }
    },
  });

  useEffect(() => {
    if (onTranscriptChange) {
      const fullTranscript = transcript + (interimTranscript ? ' ' + interimTranscript : '');
      onTranscriptChange(fullTranscript, interimTranscript === '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript, interimTranscript]); // onTranscriptChange excluded to prevent infinite loop

  const handleToggleRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled
        className={className}
        title="Speech recognition not supported"
      >
        <MicOff className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <Button
        type="button"
        variant={props.variant ?? 'outline'}
        size="icon"
        onClick={handleToggleRecording}
        disabled={disabled}
        className={cn(
          'relative',
          error && 'border-destructive'
        )}
        aria-label={isListening ? 'Stop recording' : 'Start recording'}
        title={error || (isListening ? 'Stop recording' : 'Start recording')}
      >
        {isListening && (
          <span className="absolute -inset-1 rounded-md bg-current opacity-20 animate-ping" />
        )}
        {isListening ? (
          <StopCircle className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
      
      {isListening && (
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 animate-pulse" />
      )}
    </div>
  );
}

