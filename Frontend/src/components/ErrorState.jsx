import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, FileX2, AlertOctagon, RefreshCw, PlusCircle, ArrowLeft } from 'lucide-react';

/**
 * ErrorState renders tailored visual states for expired, missing, limit-reached, or server errors.
 */
export function ErrorState({
  type = 'not_found',
  title,
  message,
  onRetry,
  retryLabel = 'Try Again',
  showHomeButton = true,
  className = '',
}) {
  let defaultTitle = 'Drop not found';
  let defaultMessage = "The code you entered doesn't exist or is no longer available.";
  let Icon = FileX2;
  let iconColor = 'text-amber-400';
  let iconBg = 'bg-amber-950/30 border-amber-800/30';
  let primaryAction = null;

  switch (type) {
    case 'expired':
      defaultTitle = 'This drop has expired.';
      defaultMessage = 'This file was automatically removed after its expiration time.';
      Icon = Lock;
      iconColor = 'text-rose-600 dark:text-rose-400';
      iconBg = 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/30';
      primaryAction = (
        <Link
          id="btn-expired-create-drop"
          to="/"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          Create Your Own Drop
        </Link>
      );
      break;

    case 'limit_reached':
      defaultTitle = 'Download limit reached';
      defaultMessage = 'This drop has reached its maximum number of downloads.';
      Icon = AlertOctagon;
      iconColor = 'text-rose-600 dark:text-rose-400';
      iconBg = 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/30';
      primaryAction = (
        <Link
          id="btn-limit-create-drop"
          to="/"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          Create Your Own Drop
        </Link>
      );
      break;

    case 'file_unavailable':
      defaultTitle = 'File unavailable';
      defaultMessage = 'The file could not be retrieved from secure storage.';
      Icon = FileX2;
      iconColor = 'text-rose-600 dark:text-rose-400';
      iconBg = 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/30';
      break;

    case 'server_error':
      defaultTitle = 'Something went wrong';
      defaultMessage = 'Please try again in a moment.';
      Icon = AlertOctagon;
      iconColor = 'text-rose-600 dark:text-rose-400';
      iconBg = 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/30';
      break;

    case 'not_found':
    default:
      defaultTitle = 'Drop not found';
      defaultMessage = "The code you entered doesn't exist or is no longer available.";
      Icon = FileX2;
      iconColor = 'text-slate-500 dark:text-slate-400';
      iconBg = 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50';
      break;
  }

  const finalTitle = title || defaultTitle;
  const finalMessage = message || defaultMessage;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      id="error-state-card"
      className={`w-full max-w-md mx-auto p-8 rounded-2xl bg-white dark:bg-[#111726]/90 border border-slate-200 dark:border-slate-800 text-center shadow-xl dark:shadow-2xl shadow-slate-900/5 dark:shadow-black/50 ${className}`}
    >
      <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center border mb-5 ${iconBg}`}>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>

      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 tracking-tight">
        {finalTitle}
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
        {finalMessage}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {primaryAction ? (
          primaryAction
        ) : onRetry ? (
          <button
            id="btn-error-retry"
            type="button"
            onClick={onRetry}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4" />
            {retryLabel}
          </button>
        ) : null}

        {showHomeButton && (
          <Link
            id="btn-error-return-receive"
            to="/receive"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Enter Another Code
          </Link>
        )}
      </div>
    </motion.div>
  );
}

export default ErrorState;

