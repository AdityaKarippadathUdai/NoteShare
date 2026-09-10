import React from 'react';
import { DownloadCloud } from 'lucide-react';

const LIMIT_OPTIONS = [
  { value: '1', label: '1' },
  { value: '3', label: '3' },
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: 'unlimited', label: 'Unlimited' },
];

/**
 * DownloadLimitSelector component for setting maximum drop downloads.
 */
export function DownloadLimitSelector({
  value = '3',
  onChange,
  disabled = false,
  lockedToOne = false,
}) {
  return (
    <div id="download-limit-wrapper" className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <DownloadCloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          Maximum downloads
        </label>
        {lockedToOne && (
          <span className="text-[11px] font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800/40">
            Locked to 1 (delete on first download)
          </span>
        )}
      </div>

      <div
        id="download-limit-segmented-control"
        className="grid grid-cols-5 gap-1 p-1 bg-slate-100 dark:bg-[#0a0f1d] rounded-xl border border-slate-200/90 dark:border-slate-800/80"
      >
        {LIMIT_OPTIONS.map((option) => {
          const isSelected = lockedToOne ? option.value === '1' : String(value) === option.value;
          const isDisabled = disabled || lockedToOne;

          return (
            <button
              key={option.value}
              type="button"
              id={`limit-btn-${option.value}`}
              disabled={isDisabled}
              onClick={() => onChange(option.value)}
              className={`py-2 px-1 text-xs font-semibold rounded-lg transition-all text-center select-none ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800/50'
              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DownloadLimitSelector;
