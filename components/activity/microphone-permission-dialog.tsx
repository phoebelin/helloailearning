/**
 * MicrophonePermissionDialog Component
 * Handles microphone permission requests with user-friendly guidance
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type PermissionState = 'prompt' | 'granted' | 'denied' | 'checking' | 'unavailable';

export interface MicrophonePermissionDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when dialog should close */
  onClose: () => void;
  /** Callback when permission is granted */
  onPermissionGranted?: () => void;
  /** Callback when permission is denied */
  onPermissionDenied?: () => void;
  /** Custom title */
  title?: string;
  /** Custom description */
  description?: string;
  /** Whether to auto-close on success */
  autoCloseOnSuccess?: boolean;
}

/**
 * Dialog component for requesting microphone permissions
 * Provides step-by-step guidance and browser-specific instructions
 */
export function MicrophonePermissionDialog({
  isOpen,
  onClose,
  onPermissionGranted,
  onPermissionDenied,
  title = 'Microphone Access Required',
  description = 'This activity uses speech recognition to help you learn. Please allow microphone access to continue.',
  autoCloseOnSuccess = true,
}: MicrophonePermissionDialogProps) {
  const [permissionState, setPermissionState] = useState<PermissionState>('checking');
  const [browserName, setBrowserName] = useState<string>('your browser');

  // Detect browser
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('chrome')) {
      setBrowserName('Chrome');
    } else if (userAgent.includes('safari')) {
      setBrowserName('Safari');
    } else if (userAgent.includes('firefox')) {
      setBrowserName('Firefox');
    } else if (userAgent.includes('edg')) {
      setBrowserName('Edge');
    }
  }, []);

  // Check initial permission state
  useEffect(() => {
    if (!isOpen) return;

    const checkPermission = async () => {
      try {
        // Check if mediaDevices API is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setPermissionState('unavailable');
          return;
        }

        // Try to check permission state (not supported in all browsers)
        if (navigator.permissions && navigator.permissions.query) {
          try {
            const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
            setPermissionState(result.state as PermissionState);
            
            // Listen for permission changes
            result.onchange = () => {
              setPermissionState(result.state as PermissionState);
              if (result.state === 'granted' && onPermissionGranted) {
                onPermissionGranted();
                if (autoCloseOnSuccess) {
                  setTimeout(onClose, 1500);
                }
              } else if (result.state === 'denied' && onPermissionDenied) {
                onPermissionDenied();
              }
            };
          } catch (err) {
            // Permission query not supported, default to prompt
            setPermissionState('prompt');
          }
        } else {
          setPermissionState('prompt');
        }
      } catch (error) {
        console.error('Error checking microphone permission:', error);
        setPermissionState('prompt');
      }
    };

    checkPermission();
  }, [isOpen, onPermissionGranted, onPermissionDenied, onClose, autoCloseOnSuccess]);

  const requestPermission = async () => {
    setPermissionState('checking');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Permission granted - stop all tracks
      stream.getTracks().forEach(track => track.stop());
      
      setPermissionState('granted');
      if (onPermissionGranted) {
        onPermissionGranted();
      }
      
      if (autoCloseOnSuccess) {
        setTimeout(onClose, 1500);
      }
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setPermissionState('denied');
      if (onPermissionDenied) {
        onPermissionDenied();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-background rounded-lg shadow-lg border">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className={cn(
              'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
              permissionState === 'granted' ? 'bg-green-100 text-green-600' :
              permissionState === 'denied' ? 'bg-red-100 text-red-600' :
              permissionState === 'unavailable' ? 'bg-yellow-100 text-yellow-600' :
              'bg-blue-100 text-blue-600'
            )}>
              {permissionState === 'granted' ? (
                <CheckCircle className="w-6 h-6" />
              ) : permissionState === 'denied' ? (
                <MicOff className="w-6 h-6" />
              ) : permissionState === 'unavailable' ? (
                <AlertCircle className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">
                {permissionState === 'granted' ? 'Microphone Access Granted!' :
                 permissionState === 'denied' ? 'Microphone Access Denied' :
                 permissionState === 'unavailable' ? 'Microphone Not Available' :
                 title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {permissionState === 'granted' ? 'You can now use speech features in this activity.' :
                 permissionState === 'denied' ? 'You need to allow microphone access to use speech features.' :
                 permissionState === 'unavailable' ? 'Microphone is not available in this browser or device.' :
                 description}
              </p>
            </div>
          </div>

          {/* Content based on permission state */}
          {permissionState === 'prompt' || permissionState === 'checking' ? (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm mb-2 font-medium">What happens next:</p>
                <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                  <li>Click "Allow Microphone Access" below</li>
                  <li>Your browser will ask for permission</li>
                  <li>Click "Allow" in the browser popup</li>
                </ol>
              </div>
              
              <Button
                onClick={requestPermission}
                disabled={permissionState === 'checking'}
                className="w-full"
                size="lg"
              >
                {permissionState === 'checking' ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Requesting Permission...
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-5 w-5" />
                    Allow Microphone Access
                  </>
                )}
              </Button>
            </div>
          ) : permissionState === 'denied' ? (
            <div className="space-y-4">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-3">
                  <HelpCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-destructive">
                    How to enable microphone access:
                  </p>
                </div>
                
                <ol className="text-sm space-y-3 list-decimal list-inside ml-2">
                  {browserName === 'Chrome' || browserName === 'Edge' ? (
                    <>
                      <li className="text-muted-foreground">
                        Click the <strong className="text-foreground">lock icon</strong> or <strong className="text-foreground">camera icon</strong> in the address bar
                      </li>
                      <li className="text-muted-foreground">
                        Change microphone permission to <strong className="text-foreground">"Allow"</strong>
                      </li>
                      <li className="text-muted-foreground">
                        Reload the page
                      </li>
                    </>
                  ) : browserName === 'Safari' ? (
                    <>
                      <li className="text-muted-foreground">
                        Go to <strong className="text-foreground">Safari → Settings for This Website</strong>
                      </li>
                      <li className="text-muted-foreground">
                        Change Microphone to <strong className="text-foreground">"Allow"</strong>
                      </li>
                      <li className="text-muted-foreground">
                        Reload the page
                      </li>
                    </>
                  ) : browserName === 'Firefox' ? (
                    <>
                      <li className="text-muted-foreground">
                        Click the <strong className="text-foreground">microphone icon</strong> in the address bar
                      </li>
                      <li className="text-muted-foreground">
                        Remove the "Blocked Temporarily" setting
                      </li>
                      <li className="text-muted-foreground">
                        Reload the page and allow access
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="text-muted-foreground">
                        Look for permission icons in your browser's address bar
                      </li>
                      <li className="text-muted-foreground">
                        Change microphone permission to "Allow"
                      </li>
                      <li className="text-muted-foreground">
                        Reload the page
                      </li>
                    </>
                  )}
                </ol>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={requestPermission}
                  variant="outline"
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button
                  onClick={onClose}
                  variant="secondary"
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          ) : permissionState === 'unavailable' ? (
            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Microphone access is not available. This could be because:
                </p>
                <ul className="text-sm space-y-2 list-disc list-inside ml-2 text-muted-foreground">
                  <li>Your browser doesn't support the Web Speech API</li>
                  <li>You're using an unsecured connection (not HTTPS)</li>
                  <li>Your device doesn't have a microphone</li>
                </ul>
              </div>
              
              <p className="text-sm text-muted-foreground">
                You can still complete this activity by typing your responses instead of using speech.
              </p>

              <Button onClick={onClose} variant="secondary" className="w-full">
                Continue Without Microphone
              </Button>
            </div>
          ) : permissionState === 'granted' ? (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4 text-center">
                <p className="text-sm text-green-700 dark:text-green-400">
                  ✓ You're all set! Speech recognition is now enabled.
                </p>
              </div>
              
              {!autoCloseOnSuccess && (
                <Button onClick={onClose} className="w-full">
                  Continue
                </Button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to manage microphone permission state
 */
export function useMicrophonePermission() {
  const [permissionState, setPermissionState] = useState<PermissionState>('checking');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setPermissionState('unavailable');
          return;
        }

        if (navigator.permissions && navigator.permissions.query) {
          try {
            const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
            setPermissionState(result.state as PermissionState);
            
            result.onchange = () => {
              setPermissionState(result.state as PermissionState);
            };
          } catch (err) {
            setPermissionState('prompt');
          }
        } else {
          setPermissionState('prompt');
        }
      } catch (error) {
        setPermissionState('prompt');
      }
    };

    checkPermission();
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionState('granted');
      return true;
    } catch (error) {
      setPermissionState('denied');
      return false;
    }
  };

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  return {
    permissionState,
    isDialogOpen,
    openDialog,
    closeDialog,
    requestPermission,
    hasPermission: permissionState === 'granted',
    needsPermission: permissionState === 'prompt' || permissionState === 'denied',
  };
}

