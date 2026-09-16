import React, { useState } from 'react';
import { getErrorMessage } from '../utils/errorUtils';
import { Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react';

/**
 * PasswordToggle component for optional password protection with confirm input and show/hide toggle.
 */
export function PasswordToggle({
  enabled = false,
  onToggle,
  password = '',
  confirmPassword = '',
  onPasswordChange,
  onConfirmPasswordChange,
  error = null,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div id="password-protection-container" className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Password Protection
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Require a secret key to download
            </p>
          </div>
        </div>

        {/* Custom accessible toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          id="password-protection-toggle"
          onClick={() => onToggle(!enabled)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#0b0f17] ${
            enabled ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div
          id="password-inputs-wrapper"
          className="space-y-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0a0f1d] border border-emerald-200 dark:border-emerald-900/40 animate-in fade-in slide-in-from-top-2 duration-150 shadow-sm"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Drop Password
            </label>
            <div className="relative">
              <input
                id="input-drop-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="Enter password..."
                className="w-full pl-3 pr-10 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="input-confirm-drop-password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => onConfirmPasswordChange(e.target.value)}
                placeholder="Re-enter password..."
                className="w-full pl-3 pr-10 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>{getErrorMessage(error)}</span>
            </div>
          )}

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Anyone with the code will still need this password to download the file.
          </p>
        </div>
      )}
    </div>
  );
}

export default PasswordToggle;
