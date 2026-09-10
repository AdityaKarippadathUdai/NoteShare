import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Download,
  Lock,
  Copy,
  Check,
  FileText,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowDownToLine,
  RefreshCw,
  PlusCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import Countdown from '../components/Countdown';
import StatusBadge from '../components/StatusBadge';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { useToast } from '../components/Toast';
import { useDrop } from '../hooks/useDrop';
import { formatFileSize, getFileTypeLabel, getFileBadge } from '../utils/fileUtils';
import { formatCode, normalizeCode } from '../utils/formatUtils';

export function DownloadPage() {
  const { code: rawCode } = useParams();
  const cleanCode = normalizeCode(rawCode);
  const { addToast } = useToast();

  const {
    drop,
    loading,
    error,
    requiresPassword,
    isUnlocked,
    isDownloading,
    loadDrop,
    unlock,
    download,
  } = useDrop(cleanCode);

  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [unlockError, setUnlockError] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Reload when code parameter changes
  useEffect(() => {
    if (cleanCode) {
      loadDrop(cleanCode);
    }
  }, [cleanCode, loadDrop]);

  const handleUnlock = async (e) => {
    e.preventDefault();
    setUnlockError(null);

    if (!passwordInput) {
      setUnlockError('Please enter the password to unlock this file.');
      return;
    }

    const res = await unlock(passwordInput);
    if (res.success) {
      addToast('File unlocked successfully!', 'success');
      setPasswordInput('');
    } else {
      const msg = res.error?.message || 'Incorrect password. Please try again.';
      setUnlockError(msg);
      addToast(msg, 'error');
    }
  };

  const handleDownload = async () => {
    const res = await download(passwordInput || null);
    if (res.success) {
      setDownloadSuccess(true);
      addToast('File downloaded successfully!', 'success');
    } else {
      const msg = res.error?.message || 'Failed to download file.';
      addToast(msg, 'error');
    }
  };

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      addToast('Share link copied to clipboard', 'success');
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      addToast('Failed to copy share link', 'error');
    }
  };

  if (loading) {
    return <LoadingState fullPage message="Connecting to secure drop..." />;
  }

  // Handle distinct backend error states (Section 20)
  if (error) {
    let errorType = 'not_found';
    if (error.code === 'DROP_EXPIRED' || error.status === 410) {
      errorType = 'expired';
    } else if (error.code === 'LIMIT_REACHED' || error.status === 403) {
      errorType = 'limit_reached';
    } else if (error.status >= 500) {
      errorType = 'server_error';
    }

    return (
      <div className="py-16 px-4">
        <ErrorState
          type={errorType}
          message={error.message}
          onRetry={() => loadDrop(cleanCode)}
        />
      </div>
    );
  }

  if (!drop) {
    return (
      <div className="py-16 px-4">
        <ErrorState
          type="not_found"
          message="No drop was found with this code."
          onRetry={() => loadDrop(cleanCode)}
        />
      </div>
    );
  }

  const isExpired = drop.expiresAt ? new Date(drop.expiresAt).getTime() <= Date.now() : false;
  const isLimitReached = drop.maxDownloads !== null && drop.downloadCount >= drop.maxDownloads;
  const remainingDownloads = drop.maxDownloads !== null ? Math.max(0, drop.maxDownloads - (drop.downloadCount || 0)) : null;

  // Fallback error screens if local expiration or limits hit
  if (isExpired) {
    return (
      <div className="py-16 px-4">
        <ErrorState
          type="expired"
          title="This drop has expired."
          message="This file was automatically removed after its expiration time."
        />
      </div>
    );
  }

  if (isLimitReached) {
    return (
      <div className="py-16 px-4">
        <ErrorState
          type="limit_reached"
          title="Download limit reached"
          message="This drop has reached its maximum number of downloads."
        />
      </div>
    );
  }

  return (
    <div className="w-full py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Top Code Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
              Drop Code:
            </span>
            <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {formatCode(cleanCode)}
            </span>
          </div>

          <StatusBadge
            status={requiresPassword ? 'protected' : 'active'}
            label={requiresPassword ? 'Protected' : 'Available'}
          />
        </div>

        {/* Conditional Screen: Password Protected OR Ready to Download */}
        {requiresPassword && !isUnlocked ? (
          /* SECTION 18: PASSWORD FLOW */
          <div
            id="password-unlock-card"
            className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl space-y-6 backdrop-blur-md"
          >
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-md">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                This drop is password protected.
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                The sender protected this file. Enter the password below to decrypt and download.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="unlock-password-input"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="unlock-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter password to unlock..."
                    autoFocus
                    className="w-full pl-4 pr-11 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {unlockError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{unlockError}</span>
                </div>
              )}

              <button
                id="btn-unlock-file"
                type="submit"
                disabled={!passwordInput.trim()}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Unlock File</span>
              </button>
            </form>
          </div>
        ) : (
          /* SECTION 17: FILE AVAILABLE & DOWNLOAD FLOW */
          <div
            id="file-download-card"
            className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl space-y-6 backdrop-blur-md"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                File available
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-slate-700">
                {getFileBadge(drop.originalFilename)}
              </span>
            </div>

            {/* File info banner */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-md">
                <FileText className="w-7 h-7" />
              </div>

              <div className="min-w-0 flex-1">
                <h3
                  id="download-file-name"
                  className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate pr-2"
                  title={drop.originalFilename}
                >
                  {drop.originalFilename}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span>{getFileTypeLabel(drop.originalFilename, drop.fileType)}</span>
                  <span>•</span>
                  <span>{formatFileSize(drop.fileSize)}</span>
                </div>
              </div>
            </div>

            {/* Drop boundaries: Countdown & Remaining Downloads */}
            <div className="grid grid-cols-1 gap-2 pt-2">
              {drop.expiresAt && (
                <Countdown expiresAt={drop.expiresAt} />
              )}

              <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 text-xs">
                <span className="text-slate-500 dark:text-slate-400">Downloads remaining</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {remainingDownloads !== null ? remainingDownloads : 'Unlimited'}
                </span>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="space-y-3 pt-2">
              <button
                id="btn-download-file"
                type="button"
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full py-4 px-6 rounded-xl font-bold text-base text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-600/25 active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Download File</span>
                  </>
                )}
              </button>

              <button
                id="btn-copy-download-link"
                type="button"
                onClick={handleCopyShareLink}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-600 dark:text-emerald-400">Link Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>Copy Share Link</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Direct secure file transfer</span>
            </div>
          </div>
        )}

        {/* Return to Home / Upload */}
        <div className="text-center pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create your own drop</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DownloadPage;
