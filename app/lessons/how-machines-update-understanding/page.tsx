'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PippyActivityProvider, usePippyActivity } from '@/lib/context/pippy-activity-context';
import { PippyStep } from '@/types/pippy-activity';

import { MeetPippyStep }            from '@/components/activities/pippy/meet-pippy-step';
import { ObserveMistakeStep }        from '@/components/activities/pippy/observe-mistake-step';
import { InvestigateTrainingStep }   from '@/components/activities/pippy/investigate-training-step';
import { InspectFixStep }            from '@/components/activities/pippy/inspect-fix-step';
import { CheckBatchStep }            from '@/components/activities/pippy/check-batch-step';
import { LevelComplete }             from '@/components/activities/pippy/level-complete';
import { SessionSummaryStep }        from '@/components/activities/pippy/session-summary-step';

// ---------- Step ↔ scroll-section mapping (mistake-first order) ----------
// 7 logical steps share 6 scroll sections:
//   0: meet-pippy
//   1: observe-mistake     (the hook)
//   2: investigate-training
//   3: inspect-fix
//   4: check-batch
//   5: level-complete | session-summary

const STEP_TO_INDEX: Partial<Record<PippyStep, number>> = {
  'meet-pippy':           0,
  'observe-mistake':      1,
  'investigate-training': 2,
  'inspect-fix':          3,
  'check-batch':          4,
  'level-complete':       5,
  'session-summary':      5,
};

const INDEX_TO_STEP: Record<number, PippyStep> = {
  0: 'meet-pippy',
  1: 'observe-mistake',
  2: 'investigate-training',
  3: 'inspect-fix',
  4: 'check-batch',
  5: 'level-complete',
};

const TOTAL_SECTIONS = 6;

// ---------- Inner component (needs context) ----------

function Chapter3Content() {
  const router = useRouter();
  const { state, goToStep } = usePippyActivity();

  const currentContextIndex = STEP_TO_INDEX[state.currentStep] ?? 0;

  // Increments each time the user submits a fix attempt, forcing CheckBatchStep
  // to remount so its didRun guard resets and runCheckBatch() fires again.
  const [checkKey, setCheckKey] = useState(0);

  const [maxReached, setMaxReachedState] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const saved = localStorage.getItem('pippy-v2-max-step');
      return saved ? Math.max(0, parseInt(saved, 10)) : 0;
    } catch { return 0; }
  });

  const setMaxReached = useCallback((updater: number | ((prev: number) => number)) => {
    setMaxReachedState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try { localStorage.setItem('pippy-v2-max-step', String(next)); } catch {}
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
  const isProgrammaticRef   = useRef(false);
  const scrollTimeoutRef    = useRef<NodeJS.Timeout | null>(null);
  const hasMountedRef       = useRef(false);
  const prevContextIdxRef   = useRef(0);
  const prevLevelRef        = useRef(state.currentLevelIndex);

  useEffect(() => {
    hasMountedRef.current = true;
    prevContextIdxRef.current = currentContextIndex;
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

  useEffect(() => {
    if (!hasMountedRef.current) return;

    const prev = prevContextIdxRef.current;
    prevContextIdxRef.current = currentContextIndex;

    if (currentContextIndex === 0 && prev > 0) {
      try { localStorage.removeItem('pippy-v2-max-step'); } catch {}
      setMaxReached(0);
      setVisibleIndex(0);
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentContextIndex === 0 || currentContextIndex <= prev) return;

    setMaxReached(p => Math.max(p, currentContextIndex));
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

  // On level change (after "Next level!"), reset the flow back to the
  // observe-mistake hook (section 1) for the new level. advanceLevel() has
  // already updated the context step + nest; here we reset progress and scroll.
  // The step sections are keyed by currentLevelIndex so they remount fresh
  // (clearing internal state like the belt animation and check-batch run guard).
  useEffect(() => {
    if (!hasMountedRef.current) return;
    if (state.currentLevelIndex === prevLevelRef.current) return;
    prevLevelRef.current = state.currentLevelIndex;

    setMaxReached(1);
    setVisibleIndex(1);
    isProgrammaticRef.current = true;
    let tries = 6;
    const go = () => {
      const el = sectionRefs[1]?.current;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => { isProgrammaticRef.current = false; }, 600);
      } else if (tries-- > 0) {
        setTimeout(go, 80);
      } else {
        isProgrammaticRef.current = false;
      }
    };
    setTimeout(go, 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentLevelIndex]);

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
                const ctxIdx = STEP_TO_INDEX[state.currentStep] ?? 0;
                if (step && index > ctxIdx &&
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
      const ctxIdx = STEP_TO_INDEX[state.currentStep] ?? 0;
      if (index > ctxIdx) {
        goToStep(INDEX_TO_STEP[index]);
      }
      const attempt = (attemptsLeft: number) => {
        setTimeout(() => {
          const el = sectionRefs[index]?.current;
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => { isProgrammaticRef.current = false; }, 600);
          } else if (attemptsLeft > 0) {
            attempt(attemptsLeft - 1);
          } else {
            isProgrammaticRef.current = false;
          }
        }, 100);
      };
      attempt(4);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [goToStep, state.currentStep]
  );

  const handleStepNext = useCallback(
    (fromIndex: number) => {
      if (fromIndex === 3) {
        // Each fix submission remounts CheckBatchStep so the check re-runs on the
        // updated workingNest (the didRun guard inside resets on unmount).
        setCheckKey(k => k + 1);
      }
      if (fromIndex === 5) {
        // "Next level!" after level-complete loops back to observe-mistake (section 1)
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
      <div className="fixed top-0 left-0 right-0 bg-white border-b z-40 shadow-xs">
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
                icon={<ChevronLeft className="w-4 h-4" />}
              >
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
                endContent={<ChevronRight className="w-4 h-4" />}
              >
                Next
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
          {/* Section 0: Meet Pippy */}
          <div
            ref={sectionRefs[0]}
            className="min-h-screen flex items-center justify-center py-12"
            style={{ scrollSnapAlign: 'start', scrollMarginTop: '80px' }}
          >
            <MeetPippyStep onNext={() => handleStepNext(0)} />
          </div>

          {/* Section 1: Observe Mistake (the hook) */}
          {maxReached >= 1 && (
            <div
              ref={sectionRefs[1]}
              className="min-h-screen flex items-center justify-center py-12"
              style={{ scrollSnapAlign: 'start', scrollMarginTop: '80px' }}
            >
              <ObserveMistakeStep key={state.currentLevelIndex} onNext={() => handleStepNext(1)} />
            </div>
          )}

          {/* Section 2: Investigate Training */}
          {maxReached >= 2 && (
            <div
              ref={sectionRefs[2]}
              className="min-h-screen flex items-center justify-center py-12"
              style={{ scrollSnapAlign: 'start', scrollMarginTop: '80px' }}
            >
              <InvestigateTrainingStep key={state.currentLevelIndex} onNext={() => handleStepNext(2)} />
            </div>
          )}

          {/* Section 3: Inspect & Fix */}
          {maxReached >= 3 && (
            <div
              ref={sectionRefs[3]}
              className="min-h-screen flex items-center justify-center py-12"
              style={{ scrollSnapAlign: 'start', scrollMarginTop: '80px' }}
            >
              <InspectFixStep key={state.currentLevelIndex} onCheckBatch={() => handleStepNext(3)} />
            </div>
          )}

          {/* Section 4: Check Batch */}
          {maxReached >= 4 && (
            <div
              ref={sectionRefs[4]}
              className="min-h-screen flex items-center justify-center py-12"
              style={{ scrollSnapAlign: 'start', scrollMarginTop: '80px' }}
            >
              <CheckBatchStep
                key={`${state.currentLevelIndex}-${checkKey}`}
                onPass={() => handleStepNext(4)}
                onFail={() => scrollTo(3)}
              />
            </div>
          )}

          {/* Section 5: Level Complete | Session Summary */}
          {maxReached >= 5 && (
            <div
              ref={sectionRefs[5]}
              className="min-h-screen flex items-center justify-center py-12"
              style={{ scrollSnapAlign: 'start', scrollMarginTop: '80px' }}
            >
              {state.currentStep === 'session-summary' ? (
                <SessionSummaryStep />
              ) : (
                <LevelComplete key={state.currentLevelIndex} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Page export ----------

export default function Chapter3Page() {
  return (
    <PippyActivityProvider>
      <Chapter3Content />
    </PippyActivityProvider>
  );
}
