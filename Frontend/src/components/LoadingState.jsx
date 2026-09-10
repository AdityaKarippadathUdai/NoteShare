import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
  * LoadingState component with subtle, professional Framer Motion animations.
  */
export function LoadingState({ message = 'Loading drop...', fullPage = false, className = '' }) {
  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
    >
      <motion.div
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(16, 185, 129, 0)',
            '0 0 0 8px rgba(16, 185, 129, 0.15)',
            '0 0 0 0 rgba(16, 185, 129, 0)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 mb-4 shadow-md dark:shadow-lg shadow-emerald-950/10"
      >
        <Loader2 className="w-7 h-7 animate-spin text-emerald-600 dark:text-emerald-400" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.2 }}
        className="text-sm font-semibold text-slate-800 dark:text-slate-200 tracking-tight"
      >
        {message}
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.2 }}
        className="text-xs text-slate-500 dark:text-slate-400 mt-1"
      >
        Checking secure server availability
      </motion.p>
    </motion.div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center w-full">
        {content}
      </div>
    );
  }

  return content;
}

export default LoadingState;

