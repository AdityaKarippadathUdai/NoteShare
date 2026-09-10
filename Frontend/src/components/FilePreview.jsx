import React from 'react';
import {
  FileText,
  FileArchive,
  Presentation,
  File,
  X,
  CheckCircle2,
} from 'lucide-react';
import { formatFileSize, getFileBadge } from '../utils/fileUtils';

/**
 * FilePreview component showing selected file details and removal trigger.
 */
export function FilePreview({ file, onRemove }) {
  if (!file) return null;

  const badge = getFileBadge(file.name);
  const sizeFormatted = formatFileSize(file.size);

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
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40',
        label: 'Word Document',
      };
    }
    if (name.endsWith('.txt')) {
      return {
        icon: FileText,
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40',
        label: 'Text Document',
      };
    }
    return {
      icon: File,
      color: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50',
      label: 'Document',
    };
  };

  const visual = getFileVisual(file.name);
  const VisualIcon = visual.icon;

  return (
    <div
      id="file-preview-card"
      className="w-full p-5 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200 dark:border-emerald-900/40 shadow-lg dark:shadow-xl shadow-slate-900/5 dark:shadow-black/40 relative overflow-hidden backdrop-blur-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center border shrink-0 ${visual.bg}`}
          >
            <VisualIcon className={`w-7 h-7 ${visual.color}`} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-slate-700">
                {badge}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {visual.label}
              </span>
            </div>

            <h4
              id="selected-file-name"
              className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate pr-2"
              title={file.name}
            >
              {file.name}
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

        <button
          type="button"
          id="btn-remove-selected-file"
          onClick={onRemove}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/40 transition-colors"
          title="Remove file"
          aria-label="Remove selected file"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default FilePreview;
