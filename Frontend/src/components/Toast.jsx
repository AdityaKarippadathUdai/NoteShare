import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getErrorMessage } from '../utils/errorUtils';

export const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newToast = { id, message: getErrorMessage(message), type, createdAt: Date.now() };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const toastHelpers = useMemo(() => ({
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
  }), [addToast]);

  const contextValue = useMemo(() => ({
    addToast,
    removeToast,
    clearToasts,
    toast: toastHelpers,
  }), [addToast, removeToast, clearToasts, toastHelpers]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div
        id="toast-notification-container"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-[calc(100vw-2rem)] sm:w-full"
        aria-live="polite"
        role="region"
        aria-label="Notifications"
      >
        <AnimatePresence>
          {toasts.map((toastItem) => {
            const isSuccess = toastItem.type === 'success';
            const isError = toastItem.type === 'error';
            const isWarning = toastItem.type === 'warning';

            let borderClasses = 'border-cyan-500/30 bg-[#0f172a]/95';
            let iconElement = <Info className="w-4 h-4 text-cyan-400 shrink-0" />;

            if (isSuccess) {
              borderClasses = 'border-emerald-500/30 bg-[#0c1a1a]/95';
              iconElement = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
            } else if (isError) {
              borderClasses = 'border-rose-500/40 bg-[#1c1018]/95';
              iconElement = <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
            } else if (isWarning) {
              borderClasses = 'border-amber-500/30 bg-[#1a170c]/95';
              iconElement = <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
            }

            return (
              <motion.div
                key={toastItem.id}
                id={`toast-${toastItem.id}`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92, y: 10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={`pointer-events-auto flex items-start justify-between gap-3 p-3.5 rounded-xl border shadow-xl shadow-black/50 backdrop-blur-md ${borderClasses}`}
              >
                <div className="flex items-start gap-2.5 min-w-0 pt-0.5">
                  {iconElement}
                  <p className="text-xs font-medium text-slate-100 leading-relaxed break-words">
                    {toastItem.message}
                  </p>
                </div>
                <button
                  type="button"
                  id={`btn-dismiss-toast-${toastItem.id}`}
                  onClick={() => removeToast(toastItem.id)}
                  className="p-1 -mr-1 -mt-0.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors shrink-0"
                  aria-label="Dismiss notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastProvider;
