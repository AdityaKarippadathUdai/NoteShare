import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { formatCode } from '../utils/formatUtils';
import { useToast } from './Toast';

/**
 * DropCode component for prominent display and copying of drop codes.
 * 
 * @param {Object} props
 * @param {string} props.code
 * @param {string} [props.className]
 */
export function DropCode({ code, className = '' }) {
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();
  const formatted = formatCode(code);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      addToast('Code copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      addToast('Failed to copy code', 'error');
    }
  };

  return (
    <div
      id="drop-code-card"
      className={`flex flex-col items-center justify-center p-6 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-emerald-900/40 shadow-md dark:shadow-xl shadow-emerald-950/5 dark:shadow-emerald-950/20 backdrop-blur-sm ${className}`}
    >
      <span className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold mb-2">
        Drop Code
      </span>
      <div className="flex items-center gap-4 my-2">
        <span
          id="displayed-drop-code"
          className="font-mono text-3xl sm:text-4xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 dark:from-emerald-400 dark:via-green-300 dark:to-teal-300 select-all"
        >
          {formatted}
        </span>
      </div>

      <button
        id="btn-copy-drop-code"
        type="button"
        onClick={handleCopy}
        className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 dark:hover:text-white border border-slate-200 dark:border-slate-700 text-xs font-semibold tracking-wide transition-all active:scale-[0.98]"
        aria-label="Copy drop code"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-emerald-600 dark:text-emerald-400">Code Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Copy Code</span>
          </>
        )}
      </button>
    </div>
  );
}

export default DropCode;
