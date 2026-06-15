'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CodaActivityProvider, useCodaActivity } from '@/lib/context/coda-activity-context';
import { CodaStep } from '@/types/coda-activity';

import { MeetCodaStep }        from '@/components/activities/coda/meet-coda-step';
import { MissionStep }         from '@/components/activities/coda/mission-step';
import { SetRewardStep }       from '@/components/activities/coda/set-reward-step';
import { RunStep }             from '@/components/activities/coda/run-step';
import { ReceiptStep }         from '@/components/activities/coda/receipt-step';
import { LevelComplete }       from '@/components/activities/coda/level-complete';
import { SessionSummaryStep }  from '@/components/activities/coda/session-summary-step';

// ---------- Step ↔ scroll-section mapping ----------
// 7 logical steps, but level-complete and session-summary share the last section.

const STEP_TO_INDEX: Partial<Record<CodaStep, number>> = {
  'meet-coda':        0,
  'mission':          1,
  'set-reward':       2,
  'run':              3,
  'receipt':          4,
  'level-complete':   5,
  'session-summary':  5,
};

const INDEX_TO_STEP: Record<number, CodaStep> = {
  0: 'meet-coda',
  1: 'mission',
  2: 'set-reward',
  3: 'run',
  4: 'receipt',
  5: 'level-complete',
};

const TOTAL_SECTIONS = 6;

// ---------- Inner component (needs context) ----------

function GoalPursuitContent() {
  const router = useRouter();
  const { state, goToStep } = useCodaActivity();

  const currentContextIndex = STEP_TO_INDEX[state.currentStep] ?? 0;

  // Persist maxReached to localStorage so returning users resume at their furthest step.
  const [maxReached, setMaxReachedState] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const saved = localStorage.getItem('coda-max-step');
      return saved ? Math.max(0, parseInt(saved, 10)) : 0;
    } catch { return 0; }
  });

  const setMaxReached = useCallback((updater: number | ((prev: number) => number)) => {
    setMaxReachedState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try { localStorage.setItem('coda-max-step', String(next)); } catch {}
      return next;
    });
  }, []);

  const [visibleIndex, setVisibleIndex] = useState(maxReached);

  const scrollRef = useRef<HTMLDivElement>(null);
  const s0 = useRef<HTMLDivElement>(null);
  const s1 = useRef<HTMLDivElement>(null);
  const s2 = useRef<HTMLDivElement>(null);
  const s3 = useRef<HTMLDivElement>(null);
  const s4 = useRef<HTMLDivElement>(null);
  const s5 = useRef<HTMLDivElement>(null);
  const sectionRefs = [s0, s1, s2, s3, s4, s5];
  const isProgrammaticRef = useRef(false);
  const scrollTimeoutRef  = useRef<NodeJS.Timeout | null>(null);
  // Distinguishes the initial mount (currentContextIndex=0 because context always starts
  // at meet-coda) from a genuine user-triggered reset via "Keep playing".
  const hasMountedRef = useRef(false);

  // On initial mount: scroll to the saved maxReached position so the user resumes
  // where they left off. Skip any reset logic — the context hasn't changed yet.
  useEffect(() => {
    hasMountedRef.current = true;
    if (maxReached > 0) {
      isProgrammaticRef.current = true;
      setTimeout(() => {
        sectionRefs[maxReached]?.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
        setVisibleIndex(maxReached);
        setTimeout(() => { isProgrammaticRef.current = false; }, 600);
      }, 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync scroll when the context step advances (user completes a step) or resets.
  // Skips the first render so the initial currentContextIndex=0 doesn't wipe saved progress.
  useEffect(() => {
    if (!hasMountedRef.current) return;

    // Genuine reset: user clicked "Keep playing" → resetActivity() → currentStep='meet-coda'.
    if (currentContextIndex === 0) {
      try { localStorage.removeItem('coda-max-step'); } catch {}
      setMaxReached(0);
      setVisibleIndex(0);
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setMaxReached(prev => Math.max(prev, currentContextIndex));
    setVisibleIndex(currentContextIndex);
    isProgrammaticRef.current = true;
    setTimeout(() => {
      sectionRefs[currentContextIndex]?.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      setTimeout(() => { isProgrammaticRef.current = false; }, 600);
    }, 80);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentContextIndex]);

  // Track manual scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {}, 150);
    };
    el.addEventListener('scroll', onScroll);
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // IntersectionObserver — update visible section from manual scroll
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const id = setTimeout(() => {
      sectionRefs.forEach((ref, index) => {
        if (!ref.current) return;
        const obs = new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting && entry.intersectionRatio > 0.5 && !isProgrammaticRef.current) {
                setVisibleIndex(index);
                setMaxReached(prev => Math.max(prev, index));
                const step = INDEX_TO_STEP[index];
                // Don't override session-summary with level-complete: both share the last section.
                if (step && step !== state.currentStep &&
                    !(state.currentStep === 'session-summary' && step === 'level-complete')) {
                  goToStep(step);
                }
              }
            });
          },
          { threshold: [0, 0.5, 1], rootMargin: '-20% 0px -20% 0px' }
        );
        obs.observe(ref.current!);
        observers.push(obs);
      });
    }, 100);
    return () => {
      clearTimeout(id);
      observers.forEach(o => o.disconnect());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxReached, state.currentStep]);

  const scrollTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= TOTAL_SECTIONS) return;
      isProgrammaticRef.current = true;
      setVisibleIndex(index);
      setMaxReached(prev => Math.max(prev, index));
      goToStep(INDEX_TO_STEP[index]);
      setTimeout(() => {
        sectionRefs[index]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => { isProgrammaticRef.current = false; }, 600);
      }, 50);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [goToStep]
  );

  const handleStepNext = useCallback(
    (fromIndex: number) => {
      // Level-complete "Continue" always loops back to the mission (section 1) for the new level.
      if (fromIndex === 5) {
        scrollTo(1);
      } else {
        scrollTo(fromIndex + 1);
      }
    },
    [scrollTo]
  );

  const levelsSolved = state.levelsCompletedThisSession.length;

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b z-40 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-[60px] py-6">
          <div className="flex items-center justify-between">
            <div className="w-20" />

            <div className="flex items-center justify-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => scrollTo(visibleIndex - 1)}
                disabled={visibleIndex === 0}
                className="text-sm"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center" style={{ width: '432px', gap: '8px' }}>
                {Array.from({ length: TOTAL_SECTIONS }).map((_, i) => (
                  <div
                    key={i}
                    className="h-3 transition-colors"
                    style={{
                      flex: 1,
                      backgroundColor: i <= visibleIndex ? '#967FD8' : '#D9D9D9',
                      borderRadius: '12px',
                    }}
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => scrollTo(visibleIndex + 1)}
                disabled={visibleIndex >= maxReached}
                className="text-sm"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {levelsSolved > 0 && (
                <span className="text-xs text-[#967FD8] font-semibold">
                  {levelsSolved} level{levelsSolved !== 1 ? 's' : ''} solved
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/courses')}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        className="overflow-y-auto h-screen"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        <div className="pt-20 pb-20">
          {/* Section 0: Meet Coda */}
          <div
            ref={sectionRefs[0]}
            className="min-h-screen flex items-center justify-center py-12"
            style={{ scrollSnapAlign: 'start', scrollMarginTop: '80px' }}
          >
            <MeetCodaStep onNext={() => handleStepNext(0)} />
          </div>

          {/* Section 1: Mission */}
          {maxReached >= 1 && (
            <div
              ref={sectionRefs[1]}
              className="min-h-screen flex items-center justify-center py-12"
              style={{ scrollSnapAlign: 'start', scrollMarginTop: '80px' }}
            >
              <MissionStep onNext={() => handleStepNext(1)} />
            </div>
          )}

          {/* Section 2: Set the reward */}
          {maxReached >= 2 && (
            <div
              ref={sectionRefs[2]}
              className="min-h-screen flex items-center justify-center py-12"
              style={{ scrollSnapAlign: 'start', scrollMarginTop: '80px' }}
            >
              <SetRewardStep onNext={() => handleStepNext(2)} />
            </div>
          )}

          {/* Section 3: Run */}
          {maxReached >= 3 && (
            <div
              ref={sectionRefs[3]}
              className="min-h-screen flex items-center justify-center py-12"
              style={{ scrollSnapAlign: 'start', scrollMarginTop: '80px' }}
            >
              <RunStep onNext={() => handleStepNext(3)} />
            </div>
          )}

          {/* Section 4: Receipt */}
          {maxReached >= 4 && (
            <div
              ref={sectionRefs[4]}
              className="min-h-screen flex items-center justify-center py-12"
              style={{ scrollSnapAlign: 'start', scrollMarginTop: '80px' }}
            >
              <ReceiptStep onNext={() => handleStepNext(4)} />
            </div>
          )}

          {/* Section 5: Level Complete OR Session Summary */}
          {maxReached >= 5 && (
            <div
              ref={sectionRefs[5]}
              className="min-h-screen flex items-center justify-center py-12"
              style={{ scrollSnapAlign: 'start', scrollMarginTop: '80px' }}
            >
              {state.currentStep === 'session-summary' ? (
                <SessionSummaryStep onNext={() => {}} />
              ) : (
                <LevelComplete onNext={() => handleStepNext(5)} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Page export ----------

export default function GoalPursuitPage() {
  return (
    <CodaActivityProvider>
      <GoalPursuitContent />
    </CodaActivityProvider>
  );
}
