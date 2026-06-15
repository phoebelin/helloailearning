'use client';

import { Button } from '@/components/ui/button';
import { CodaStepProps } from '@/types/coda-activity';
import { useCodaActivity } from '@/lib/context/coda-activity-context';

export function SetRewardStep({ onNext }: CodaStepProps) {
  const { state, currentLevel, placeCoin, removeCoin } = useCodaActivity();

  if (!currentLevel) return null;

  const { coins } = state.workingReward;
  const exit = currentLevel.intendedPath[currentLevel.intendedPath.length - 1];

  const toggleExitCoin = () => {
    const existing = coins.find(c => c.id === 'exit-coin');
    if (existing) {
      removeCoin('exit-coin');
    } else {
      placeCoin({ id: 'exit-coin', at: exit, value: 10, oneTime: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Give Coda a reward</h1>
      <p className="text-gray-600 max-w-md mb-8 text-lg">
        Coda will chase whatever earns points. Place a coin where you want Coda to go —
        nothing is suggested for you.
      </p>

      <div
        className="max-w-md w-full rounded-2xl p-6 mb-8 text-left"
        style={{ backgroundColor: '#f3efff' }}
      >
        <p className="text-sm font-bold text-[#967FD8] mb-3">Coda&apos;s reward (what it sees)</p>
        {coins.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No coins placed yet — Coda has nothing to chase.</p>
        ) : (
          <ul className="text-sm text-gray-700 space-y-1">
            {coins.map(c => (
              <li key={c.id}>
                Coin worth {c.value} points at ({c.at.x}, {c.at.y})
                {c.oneTime ? ' — one-time' : ''}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button
        onClick={toggleExitCoin}
        variant="outline"
        className="text-base px-8 py-3 mb-4"
        style={{ borderRadius: '12px' }}
      >
        {coins.some(c => c.id === 'exit-coin') ? 'Remove coin at exit' : 'Place a coin at the exit'}
      </Button>

      <Button
        onClick={onNext}
        className="bg-black text-white hover:bg-black/90 text-base px-8 py-3"
        style={{ borderRadius: '12px' }}
      >
        Run Coda
      </Button>
    </div>
  );
}
