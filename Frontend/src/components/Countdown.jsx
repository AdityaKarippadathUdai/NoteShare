import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { useCountdown } from '../hooks/useCountdown';

/**
 * Countdown component rendering live expiration time.
 * 
 * @param {Object} props
 * @param {string} props.expiresAt
 * @param {() => void} [props.onExpire]
 * @param {string} [props.className]
 */
export function Countdown({ expiresAt, onExpire, className = '' }) {
  const { formattedTime, isExpired, totalSecondsLeft } = useCountdown(expiresAt, onExpire);

  const isUrgent = !isExpired && totalSecondsLeft <= 300; // less than 5 mins

  return (
    <div
      id="countdown-container"
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-colors ${
        isExpired
          ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-400'
          : isUrgent
          ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 animate-pulse'
          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300'
      } ${className}`}
    >
      <Clock className={`w-4 h-4 shrink-0 ${isExpired ? 'text-rose-600 dark:text-rose-400' : isUrgent ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
          {isExpired ? 'Status' : 'Expires in'}
        </span>
        <span
          id="countdown-timer-text"
          className={`font-mono text-sm font-bold tracking-tight ${
            isExpired ? 'text-rose-700 dark:text-rose-400' : isUrgent ? 'text-amber-700 dark:text-amber-300' : 'text-slate-900 dark:text-slate-100'
          }`}
        >
          {formattedTime}
        </span>
      </div>
    </div>
  );
}

export default Countdown;
