import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownToLine, ArrowRight, KeyRound, Sparkles } from 'lucide-react';
import { normalizeCode } from '../utils/formatUtils';
import { useToast } from '../components/Toast';

export function Receive() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [codeInput, setCodeInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-uppercase and format input
  const handleInputChange = (e) => {
    const raw = e.target.value.toUpperCase();
    setCodeInput(raw);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanCode = normalizeCode(codeInput);

    if (!cleanCode) {
      addToast('Please enter a valid drop code.', 'warning');
      return;
    }

    if (cleanCode.length < 4) {
      addToast('Drop codes are typically 6 characters long.', 'warning');
      return;
    }

    setIsSubmitting(true);
    // Navigate directly to download/lookup page
    navigate(`/d/${cleanCode}`);
  };

  return (
    <div className="w-full py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-md mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-md dark:shadow-xl shadow-emerald-950/10">
            <ArrowDownToLine className="w-7 h-7" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Enter a Drop Code
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            Enter the code shared with you to access the file.
          </p>
        </div>

        {/* Input Form Card */}
        <div
          id="receive-code-card"
          className="p-8 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl backdrop-blur-md space-y-6"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="input-drop-code"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block"
              >
                Drop Code
              </label>

              <div className="relative">
                <input
                  id="input-drop-code"
                  type="text"
                  value={codeInput}
                  onChange={handleInputChange}
                  placeholder="e.g. 7KQ-92P"
                  maxLength={12}
                  autoComplete="off"
                  spellCheck="false"
                  autoFocus
                  className="w-full text-center px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 font-mono text-2xl font-bold tracking-widest text-emerald-700 dark:text-emerald-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all uppercase"
                />
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                Codes are case-insensitive. Hyphens are optional.
              </p>
            </div>

            <button
              id="btn-get-file"
              type="submit"
              disabled={isSubmitting || !codeInput.trim()}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Get File</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Helper hint */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Instant direct decryption</span>
            </span>
            <span className="text-slate-500 dark:text-slate-400">No account required</span>
          </div>
        </div>

        {/* Demo drop hint banner */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 text-center shadow-sm dark:shadow-none">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Trying out the demo? Test with code:{' '}
            <button
              type="button"
              onClick={() => setCodeInput('7KQ92P')}
              className="font-mono text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-semibold underline underline-offset-2 ml-1 cursor-pointer"
            >
              7KQ-92P
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Receive;
