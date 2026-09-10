import React from 'react';
import { Lock, ShieldCheck, Clock, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

/**
 * StatusBadge component for rendering active, expired, limit-reached, or protected badges.
 */
export function StatusBadge({ status = 'active', label, className = '' }) {
  let badgeStyles = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  let Icon = CheckCircle2;
  let text = label || 'Active';

  switch (status) {
    case 'active':
      badgeStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/30';
      Icon = CheckCircle2;
      text = label || 'Active';
      break;
    case 'expiring':
      badgeStyles = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/30';
      Icon = Clock;
      text = label || 'Expiring Soon';
      break;
    case 'expired':
      badgeStyles = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/30';
      Icon = XCircle;
      text = label || 'Expired';
      break;
    case 'limit_reached':
      badgeStyles = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/30';
      Icon = AlertTriangle;
      text = label || 'Limit Reached';
      break;
    case 'protected':
      badgeStyles = 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800/80 dark:text-slate-200 dark:border-slate-700';
      Icon = Lock;
      text = label || 'Password Protected';
      break;
    case 'unlocked':
      badgeStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/30';
      Icon = ShieldCheck;
      text = label || 'Unlocked';
      break;
    default:
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyles} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{text}</span>
    </span>
  );
}

export default StatusBadge;
