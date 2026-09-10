import React from 'react';

/**
 * ProgressBar component displaying upload completion or indeterminate animation.
 * 
 * @param {Object} props
 * @param {number|null} [props.progress] - 0 to 100, or null for indeterminate
 * @param {string} [props.label]
 * @param {string} [props.className]
 */
export function ProgressBar({ progress = null, label = 'Uploading...', className = '' }) {
  const isDeterminate = typeof progress === 'number' && progress >= 0 && progress <= 100;

  return (
    <div id="upload-progress-container" className={`w-full space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {label}
        </span>
        <span>{isDeterminate ? `${Math.round(progress)}%` : 'Processing...'}</span>
      </div>

      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800/80 border border-slate-300/60 dark:border-slate-700/50 overflow-hidden relative">
        {isDeterminate ? (
          <div
            id="determinate-progress-bar"
            className="h-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-400 rounded-full transition-all duration-200 ease-out shadow-[0_0_12px_rgba(16,185,129,0.4)]"
            style={{ width: `${progress}%` }}
          />
        ) : (
          <div
            id="indeterminate-progress-bar"
            className="h-full w-1/3 bg-gradient-to-r from-emerald-600 to-green-400 rounded-full animate-[shimmer_1.5s_infinite_linear]"
            style={{
              animation: 'indeterminateSlide 1.6s infinite ease-in-out',
            }}
          />
        )}
      </div>

      <style>{`
        @keyframes indeterminateSlide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(150%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  );
}

export default ProgressBar;
