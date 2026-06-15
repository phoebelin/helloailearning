'use client';

import { Button } from '@/components/ui/button';
import { CodaStepProps } from '@/types/coda-activity';
import { useCodaActivity } from '@/lib/context/coda-activity-context';
import { summarizeReceipt } from '@/lib/data/coda-planner';

export function ReceiptStep({ onNext }: CodaStepProps) {
  const { state, matchesCurrentTarget, resetRewardForLevel, goToStep } = useCodaActivity();

  if (!state.lastRun) return null;

  const receipt = summarizeReceipt(state.lastRun);

  const handleTryAgain = () => {
    resetRewardForLevel();
    goToStep('set-reward');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Coda&apos;s receipt</h1>

      <div
        className="max-w-md w-full rounded-2xl p-6 mb-6 text-left"
        style={{ backgroundColor: '#f3efff' }}
      >
        <p className="text-sm font-bold text-[#967FD8] mb-3">Points earned</p>
        {receipt.lineItems.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No points earned.</p>
        ) : (
          <ul className="text-sm text-gray-700 space-y-1 mb-3">
            {receipt.lineItems.map(item => (
              <li key={item.label} className="flex justify-between">
                <span>{item.label}</span>
                <span className="font-semibold">{item.points > 0 ? `+${item.points}` : item.points}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex justify-between font-bold text-black border-t pt-2">
          <span>Total</span>
          <span>{receipt.total}</span>
        </div>
      </div>

      <p className="text-gray-700 max-w-md mb-8 text-base leading-relaxed">{receipt.verdict}</p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {matchesCurrentTarget ? (
          <Button
            onClick={onNext}
            className="bg-black text-white hover:bg-black/90 text-base px-8 py-3"
            style={{ borderRadius: '12px' }}
          >
            Continue
          </Button>
        ) : (
          <Button
            onClick={handleTryAgain}
            className="bg-black text-white hover:bg-black/90 text-base px-8 py-3"
            style={{ borderRadius: '12px' }}
          >
            Try a different reward
          </Button>
        )}
      </div>
    </div>
  );
}
