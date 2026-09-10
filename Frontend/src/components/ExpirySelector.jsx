import React from 'react';
import { Clock } from 'lucide-react';

const EXPIRY_OPTIONS = [
  { value: '10m', label: '10 min' },
  { value: '30m', label: '30 min' },
  { value: '1h', label: '1 hour' },
  { value: '24h', label: '24 hours' },
];

/**
 * ExpirySelector segmented control for setting drop expiration time.
 */
export function ExpirySelector({ value = '30m', onChange, disabled = false }) {
  return (
    <div id="expiry-selector-wrapper" className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          Expires after
        </label>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {EXPIRY_OPTIONS.find((o) => o.value === value)?.label || '30 minutes'}
        </span>
      </div>

      <div
        id="expiry-segmented-control"
        className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-[#0a0f1d] rounded-xl border border-slate-200/90 dark:border-slate-800/80"
      >
        {EXPIRY_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              id={`expiry-btn-${option.value}`}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={`py-2 px-2 text-xs font-semibold rounded-lg transition-all text-center select-none ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800/50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ExpirySelector;
