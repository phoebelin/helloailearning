'use client';

import { RunResult } from '@/types/coda-activity';
import { summarizeReceipt } from '@/lib/data/coda-planner';

interface ReceiptPanelProps {
  runResult: RunResult;
}

/**
 * Itemized receipt — every point attributed to a specific action.
 * PRD principle c: show the work, not just the verdict.
 */
export function ReceiptPanel({ runResult }: ReceiptPanelProps) {
  const receipt = summarizeReceipt(runResult);

  return (
    <div
      className="w-full max-w-sm rounded-2xl overflow-hidden"
      style={{
        border: '2px solid #e5e0f0',
        backgroundColor: '#fff',
        fontFamily: 'monospace',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      {/* Receipt header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #967FD8 0%, #7c5fc4 100%)',
          padding: '12px 20px',
        }}
      >
        <p className="text-xs font-bold text-white/80 uppercase tracking-widest">
          Coda&rsquo;s Point Receipt
        </p>
      </div>

      {/* Line items */}
      <div style={{ padding: '16px 20px' }}>
        {receipt.lineItems.length === 0 ? (
          <p className="text-sm text-fg-subtle italic">No points earned.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {receipt.lineItems.map((item, i) => (
              <div key={i} className="flex justify-between items-baseline gap-2">
                <span className="text-sm text-fg-muted flex-1">{item.label}</span>
                <span
                  className="text-sm font-bold tabular-nums"
                  style={{ color: item.points >= 0 ? '#16a34a' : '#dc2626' }}
                >
                  {item.points >= 0 ? `+${item.points}` : item.points}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Divider + Total */}
        <div
          className="flex justify-between items-baseline mt-3 pt-3"
          style={{ borderTop: '1.5px solid #e5e0f0' }}
        >
          <span className="text-sm font-bold text-black uppercase tracking-wide">Total</span>
          <span className="text-lg font-black tabular-nums text-black">{receipt.total}</span>
        </div>
      </div>

      {/* Verdict */}
      <div
        style={{
          padding: '12px 20px 16px',
          backgroundColor: '#f8f6ff',
          borderTop: '1px solid #e5e0f0',
        }}
      >
        <p className="text-xs font-semibold text-[#967FD8] uppercase tracking-wide mb-1">
          Verdict
        </p>
        <p className="text-sm text-fg-muted leading-relaxed">{receipt.verdict}</p>
      </div>
    </div>
  );
}
