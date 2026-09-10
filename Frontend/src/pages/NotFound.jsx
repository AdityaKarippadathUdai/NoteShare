import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';

export function NotFound() {
  return (
    <div className="w-full py-20 px-4 flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200 dark:border-slate-800 text-center shadow-xl dark:shadow-2xl space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            The page or drop URL you are looking for does not exist or has expired.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs tracking-wide transition-all shadow-md shadow-emerald-600/20 active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home</span>
          </Link>
          <Link
            to="/receive"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 font-medium text-xs tracking-wide transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Enter Code</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
