import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  AlertCircle,
  X,
  CheckCircle2,
  FileText,
  FileArchive,
  Presentation,
  File,
  RefreshCw,
} from 'lucide-react';
import {
  validateFile,
  SUPPORTED_EXTENSIONS,
  MAX_FILE_SIZE_MB,
  formatFileSize,
  getFileBadge,
} from '../utils/fileUtils';
import { useToast } from './Toast';

/**
 * FileDropzone component using Tailwind CSS and Framer Motion.
 * Handles drag-and-drop events, displays animated file validation errors,
 * and renders a clean preview card once a file is accepted.
 */
export function FileDropzone({
  file = null,
  onFileSelected,
  onFileAccepted,
  onRemove,
  disabled = false,
  className = '',
  maxSizeMB = MAX_FILE_SIZE_MB,
}) {
  const fileInputRef = useRef(null);
  const [internalFile, setInternalFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [errorKey, setErrorKey] = useState(0);

  // Centralized Toast notification hook
  const { addToast } = useToast();

  // Active file: prioritize controlled prop, fallback to internal state
  const activeFile = file || internalFile;

  const handleFileProcess = (incomingFile) => {
    setErrorMessage(null);
    if (!incomingFile) return;

    const validation = validateFile(incomingFile);
    if (!validation.valid) {
      setErrorMessage(validation.error);
      setErrorKey((prev) => prev + 1);
      if (addToast) {
        addToast(validation.error, 'error');
      }
      return;
    }

    setInternalFile(incomingFile);
    if (onFileSelected) onFileSelected(incomingFile);
    if (onFileAccepted) onFileAccepted(incomingFile);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only deactivate if leaving the actual container
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles || droppedFiles.length === 0) return;

    if (droppedFiles.length > 1) {
      const warningMsg = 'Please drop a single file at a time.';
      setErrorMessage(warningMsg);
      setErrorKey((prev) => prev + 1);
      if (addToast) {
        addToast(warningMsg, 'warning');
      }
      return;
    }

    handleFileProcess(droppedFiles[0]);
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
      e.target.value = '';
    }
  };

  const triggerBrowse = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerBrowse();
    }
  };

  const handleClearFile = (e) => {
    if (e) e.stopPropagation();
    setInternalFile(null);
    setErrorMessage(null);
    if (onRemove) onRemove();
  };

  const getFileVisual = (filename = '') => {
    const name = filename.toLowerCase();
    if (name.endsWith('.pdf')) {
      return {
        icon: FileText,
        color: 'text-rose-400',
        bg: 'bg-rose-950/40 border-rose-800/40',
        label: 'PDF Document',
      };
    }
    if (name.endsWith('.zip')) {
      return {
        icon: FileArchive,
        color: 'text-amber-400',
        bg: 'bg-amber-950/40 border-amber-800/40',
        label: 'ZIP Archive',
      };
    }
    if (name.endsWith('.pptx')) {
      return {
        icon: Presentation,
        color: 'text-orange-400',
        bg: 'bg-orange-950/40 border-orange-800/40',
        label: 'Presentation',
      };
    }
    if (name.endsWith('.doc') || name.endsWith('.docx')) {
      return {
        icon: FileText,
        color: 'text-blue-400',
        bg: 'bg-blue-950/40 border-blue-800/40',
        label: 'Word Document',
      };
    }
    if (name.endsWith('.txt')) {
      return {
        icon: FileText,
        color: 'text-emerald-400',
        bg: 'bg-emerald-950/40 border-emerald-800/40',
        label: 'Text Document',
      };
    }
    return {
      icon: File,
      color: 'text-cyan-400',
      bg: 'bg-cyan-950/40 border-cyan-800/40',
      label: 'Document',
    };
  };

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* Hidden native file input for click-to-browse */}
      <input
        ref={fileInputRef}
        id="file-upload-input"
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.pptx,.txt,.zip"
        onChange={handleInputChange}
        disabled={disabled}
      />

      <AnimatePresence mode="wait">
        {!activeFile ? (
          /* ================= DRAG & DROP ZONE ================= */
          <motion.div
            key="dropzone-area"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <motion.div
              id="file-dropzone-zone"
              role="button"
              tabIndex={disabled ? -1 : 0}
              onClick={triggerBrowse}
              onKeyDown={handleKeyDown}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              whileHover={disabled ? {} : { scale: 1.006 }}
              whileTap={disabled ? {} : { scale: 0.995 }}
              className={`group relative flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl border-2 border-dashed transition-colors duration-200 cursor-pointer select-none text-center backdrop-blur-sm ${
                isDragOver
                  ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 shadow-2xl shadow-emerald-500/20'
                  : errorMessage
                  ? 'border-rose-400 bg-rose-50/60 dark:border-rose-700/60 dark:bg-rose-950/15 hover:border-rose-500'
                  : 'border-slate-300 hover:border-emerald-500/80 dark:border-slate-700/80 dark:hover:border-emerald-500/70 bg-white hover:bg-emerald-50/20 dark:bg-[#0f172a]/80 dark:hover:bg-[#131d33]/90 shadow-sm dark:shadow-none'
              } ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
              aria-label="Upload document dropzone"
            >
              {/* Dynamic animated icon */}
              <motion.div
                animate={
                  isDragOver
                    ? { scale: [1, 1.12, 1.08], rotate: [0, -3, 3, 0] }
                    : { scale: 1, rotate: 0 }
                }
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className={`w-16 h-16 mb-4 rounded-2xl flex items-center justify-center border transition-all duration-200 ${
                  isDragOver
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-500/40'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-600 group-hover:bg-emerald-100 group-hover:border-emerald-300 group-hover:text-emerald-700 dark:bg-slate-800/80 dark:border-slate-700 dark:text-emerald-400 shadow-sm'
                }`}
              >
                <UploadCloud className="w-8 h-8" />
              </motion.div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 tracking-tight">
                {isDragOver ? 'Release to drop your file' : 'Drop your file here'}
              </h3>

              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                or{' '}
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold underline decoration-emerald-500/40 underline-offset-4 group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                  click to browse
                </span>
              </p>

              {/* Supported file extension pills */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-sm mb-2">
                {SUPPORTED_EXTENSIONS.map((ext) => (
                  <span
                    key={ext}
                    className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/60"
                  >
                    {ext.replace('.', '').toUpperCase()}
                  </span>
                ))}
              </div>

              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                Maximum file size: {maxSizeMB} MB
              </span>
            </motion.div>
          </motion.div>
        ) : (
          /* ================= CLEAN PREVIEW CARD ================= */
          <motion.div
            key="file-preview-card"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            id="file-preview-card"
            className="w-full p-5 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200 dark:border-emerald-900/40 shadow-lg dark:shadow-xl relative overflow-hidden backdrop-blur-md"
          >
            {(() => {
              const visual = getFileVisual(activeFile.name);
              const VisualIcon = visual.icon;
              const badge = getFileBadge(activeFile.name);
              const sizeFormatted = formatFileSize(activeFile.size);

              return (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.05, duration: 0.2 }}
                      className={`w-14 h-14 rounded-xl flex items-center justify-center border shrink-0 ${visual.bg}`}
                    >
                      <VisualIcon className={`w-7 h-7 ${visual.color}`} />
                    </motion.div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-slate-800 dark:text-emerald-300 dark:border-slate-700">
                          {badge}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {visual.label}
                        </span>
                      </div>

                      <h4
                        id="selected-file-name"
                        className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate pr-2"
                        title={activeFile.name}
                      >
                        {activeFile.name}
                      </h4>

                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span>{sizeFormatted}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          Ready to drop
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Change or Remove */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={triggerBrowse}
                      disabled={disabled}
                      className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 dark:text-slate-400 dark:hover:text-emerald-300 dark:hover:bg-slate-800/80 dark:hover:border-slate-700/60 transition-colors"
                      title="Change file"
                      aria-label="Choose a different file"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      id="btn-remove-selected-file"
                      onClick={handleClearFile}
                      disabled={disabled}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/30 dark:hover:border-rose-900/40 transition-colors"
                      title="Remove file"
                      aria-label="Remove selected file"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= ANIMATED VALIDATION ERROR ALERT ================= */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            key={`error-${errorKey}`}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              x: [0, -4, 4, -2, 2, 0],
            }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            id="dropzone-error-msg"
            className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 dark:bg-rose-950/50 dark:border-rose-800/50 dark:text-rose-200 text-xs font-medium shadow-md shadow-rose-500/5"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span className="truncate">{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-100 dark:text-rose-400 dark:hover:text-rose-200 dark:hover:bg-rose-900/40 rounded-lg transition-colors shrink-0"
              aria-label="Dismiss error"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FileDropzone;

