import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Copy,
  Share2,
  ExternalLink,
  PlusCircle,
  FileText,
  Clock,
  Download,
  Shield,
  Check,
} from 'lucide-react';
import DropCode from '../components/DropCode';
import Countdown from '../components/Countdown';
import StatusBadge from '../components/StatusBadge';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { useToast } from '../components/Toast';
import dropService from '../services/dropService';
import { formatFileSize, getFileTypeLabel, getFileBadge } from '../utils/fileUtils';
import { normalizeCode } from '../utils/formatUtils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: 'easeOut' },
  },
};

export function DropCreated() {
  const { code: rawCode } = useParams();
  const location = useLocation();
  const { addToast } = useToast();

  const code = normalizeCode(rawCode);
  const [drop, setDrop] = useState(location.state?.drop || null);
  const [loading, setLoading] = useState(!location.state?.drop);
  const [error, setError] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Generate direct receiver URL
  const receiverUrl = `${window.location.origin}/d/${code}`;

  useEffect(() => {
    if (!drop && code) {
      setLoading(true);
      dropService
        .getDrop(code)
        .then((data) => {
          setDrop(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err);
          setLoading(false);
        });
    }
  }, [code, drop]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(receiverUrl);
      setLinkCopied(true);
      addToast('Share link copied to clipboard', 'success');
      setTimeout(() => setLinkCopied(false), 2200);
    } catch {
      addToast('Failed to copy link', 'error');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `NoteDrop: ${drop?.originalFilename || 'Shared Document'}`,
          text: `Download '${drop?.originalFilename || 'this file'}' with NoteDrop code ${code}:`,
          url: receiverUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  if (loading) {
    return <LoadingState fullPage message="Retrieving drop details..." />;
  }

  if (error) {
    return (
      <div className="py-16 px-4">
        <ErrorState
          type={error.code === 'DROP_EXPIRED' ? 'expired' : 'not_found'}
          message={error.message}
        />
      </div>
    );
  }

  const isExpired = drop?.expiresAt ? new Date(drop.expiresAt).getTime() <= Date.now() : false;
  const isLimitReached = drop?.maxDownloads !== null && drop?.downloadCount >= drop?.maxDownloads;

  let currentStatus = 'active';
  let statusText = 'Active';
  if (isExpired) {
    currentStatus = 'expired';
    statusText = 'Drop Expired';
  } else if (isLimitReached) {
    currentStatus = 'limit_reached';
    statusText = 'Download Limit Reached';
  } else if (drop?.hasPassword) {
    currentStatus = 'protected';
    statusText = 'Password Protected';
  }

  return (
    <div className="w-full py-8 sm:py-12 px-4 sm:px-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto space-y-8"
      >
        {/* Success header */}
        <motion.div variants={itemVariants} className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Drop created successfully</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Share this code with the recipient
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            The receiver can access this file immediately by entering the code or opening the direct link.
          </p>
        </motion.div>

        {/* Primary Code & Expiration Banner */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DropCode code={code} />

          <div className="flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
                  Drop Status
                </span>
                <StatusBadge status={currentStatus} label={statusText} />
              </div>

              {drop?.expiresAt && (
                <Countdown
                  expiresAt={drop.expiresAt}
                  onExpire={() => {
                    setDrop((prev) => (prev ? { ...prev, isExpired: true } : null));
                  }}
                />
              )}

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                The frontend countdown is informational only. All access rules are strictly enforced by the server.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {drop?.hasPassword ? 'Password protection active' : 'Direct code access'}
              </span>
              <span>
                {drop?.maxDownloads ? `${drop.downloadCount || 0} / ${drop.maxDownloads} downloads` : 'Unlimited downloads'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Share Link Section */}
        <motion.div
          variants={itemVariants}
          id="share-link-section"
          className="p-6 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl space-y-3"
        >
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            Shareable Download Link
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full relative">
              <input
                id="share-url-input"
                type="text"
                readOnly
                value={receiverUrl}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-mono text-slate-800 dark:text-slate-200 select-all focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                id="btn-copy-share-link"
                type="button"
                onClick={handleCopyLink}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs tracking-wide transition-all shadow-md shadow-emerald-600/20 active:scale-[0.98] shrink-0"
              >
                {linkCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <button
                id="btn-native-share"
                type="button"
                onClick={handleNativeShare}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 font-medium text-xs tracking-wide transition-colors shrink-0"
              >
                <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Drop Information Summary Card */}
        <motion.div
          variants={itemVariants}
          id="drop-info-card"
          className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl space-y-4"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-300 uppercase tracking-wider">
              Drop Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">File</span>
              <p className="font-semibold text-slate-900 dark:text-slate-200 truncate" title={drop?.originalFilename}>
                {drop?.originalFilename || 'Document'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Type</span>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {getFileTypeLabel(drop?.originalFilename, drop?.fileType)}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Size</span>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {formatFileSize(drop?.fileSize)}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Downloads</span>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {drop?.maxDownloads !== null && drop?.maxDownloads !== undefined
                  ? `${drop.downloadCount || 0} / ${drop.maxDownloads}`
                  : 'Unlimited'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Password Protection</span>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {drop?.hasPassword ? 'Password Required' : 'No Password'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Status</span>
              <div className="pt-0.5">
                <StatusBadge status={currentStatus} label={statusText} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action navigation */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800/80">
          <Link
            to="/"
            id="link-create-another-drop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 font-medium text-xs tracking-wide transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Upload Another File
          </Link>

          <Link
            to={`/d/${code}`}
            id="link-open-receiver-preview"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 font-medium text-xs tracking-wide transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Recipient Page
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default DropCreated;

