import React from 'react';
import { Sliders, Flame } from 'lucide-react';
import ExpirySelector from './ExpirySelector';
import DownloadLimitSelector from './DownloadLimitSelector';
import PasswordToggle from './PasswordToggle';

/**
 * UploadSettings component for configuring expiration, download limits, password, and burn-after-reading.
 */
export function UploadSettings({
  expiresIn,
  onExpiresInChange,
  maxDownloads,
  onMaxDownloadsChange,
  passwordEnabled,
  onPasswordToggle,
  password,
  onPasswordChange,
  confirmPassword,
  onConfirmPasswordChange,
  passwordError,
  deleteAfterFirstDownload,
  onDeleteAfterFirstDownloadChange,
  disabled = false,
}) {
  const handleDeleteAfterFirstToggle = (newValue) => {
    onDeleteAfterFirstDownloadChange(newValue);
    if (newValue) {
      // When burn after download is active, download limit is locked to 1
      onMaxDownloadsChange('1');
    }
  };

  return (
    <div
      id="upload-settings-card"
      className="w-full p-6 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl space-y-6"
    >
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400">
          <Sliders className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Drop Settings
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure security, expiration, and download boundaries
          </p>
        </div>
      </div>

      {/* Expiry Selector */}
      <ExpirySelector
        value={expiresIn}
        onChange={onExpiresInChange}
        disabled={disabled}
      />

      {/* Download Limit Selector */}
      <DownloadLimitSelector
        value={maxDownloads}
        onChange={onMaxDownloadsChange}
        disabled={disabled}
        lockedToOne={deleteAfterFirstDownload}
      />

      {/* Delete After First Download Toggle (Red Accent) */}
      <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-2.5">
            <div className={`p-1.5 rounded-lg border mt-0.5 ${deleteAfterFirstDownload ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-800/40 dark:text-rose-400' : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}>
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <label
                htmlFor="delete-after-download-switch"
                className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider block cursor-pointer"
              >
                Delete after first download
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Automatically destroy this file after its first successful download.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="delete-after-download-switch"
            role="switch"
            aria-checked={deleteAfterFirstDownload}
            disabled={disabled}
            onClick={() => handleDeleteAfterFirstToggle(!deleteAfterFirstDownload)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#0b0f17] ${
              deleteAfterFirstDownload ? 'bg-rose-600' : 'bg-slate-200 dark:bg-slate-700'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                deleteAfterFirstDownload ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Password Protection Toggle & Inputs */}
      <div className="border-t border-slate-200/80 dark:border-slate-800/80">
        <PasswordToggle
          enabled={passwordEnabled}
          onToggle={onPasswordToggle}
          password={password}
          confirmPassword={confirmPassword}
          onPasswordChange={onPasswordChange}
          onConfirmPasswordChange={onConfirmPasswordChange}
          error={passwordError}
        />
      </div>
    </div>
  );
}

export default UploadSettings;
