import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownToLine, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer
      id="main-footer"
      className="w-full border-t border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#080c14] py-12 px-4 sm:px-6 mt-auto transition-colors duration-200"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        {/* Brand & tagline */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <ArrowDownToLine className="w-3.5 h-3.5" />
            </div>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              NoteDrop
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Simple temporary file sharing.
          </p>
          <p className="text-[11px] text-slate-500">
            Files automatically expire based on the drop settings.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400">
          <Link
            to="/"
            id="footer-link-home"
            className="hover:text-emerald-600 dark:hover:text-slate-200 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/about"
            id="footer-link-about"
            className="hover:text-emerald-600 dark:hover:text-slate-200 transition-colors"
          >
            How It Works
          </Link>
          <Link
            to="/receive"
            id="footer-link-receive"
            className="hover:text-emerald-600 dark:hover:text-slate-200 transition-colors"
          >
            Receive File
          </Link>
        </div>

        {/* Security badge / note */}
        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-400 bg-emerald-50/70 dark:bg-slate-900/80 px-3 py-1.5 rounded-xl border border-emerald-200/80 dark:border-slate-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Server-enforced expiration & cleanup</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

