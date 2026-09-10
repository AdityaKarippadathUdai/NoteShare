import React from 'react';
import { Link } from 'react-router-dom';
import {
  UploadCloud,
  Share2,
  Download,
  ShieldCheck,
  Clock,
  Lock,
  Flame,
  KeyRound,
  FileCheck2,
  ArrowRight,
} from 'lucide-react';

export function About() {
  const steps = [
    {
      num: '01',
      title: 'Upload',
      desc: 'Choose a document and configure expiration time, download limits, and optional password protection.',
      icon: UploadCloud,
    },
    {
      num: '02',
      title: 'Share',
      desc: 'Get an unambiguous 6-character drop code or a direct receiver URL to share with recipients.',
      icon: Share2,
    },
    {
      num: '03',
      title: 'Download',
      desc: 'The recipient enters the code, provides the password if required, and retrieves the file directly.',
      icon: Download,
    },
  ];

  const securityFeatures = [
    {
      icon: KeyRound,
      title: 'No Account Required',
      desc: 'Send and receive files instantly without registration, credentials, or tracking cookies.',
    },
    {
      icon: Clock,
      title: 'Server-Side Expiration',
      desc: 'Strict server enforcement ensures files expire automatically regardless of frontend state.',
    },
    {
      icon: Lock,
      title: 'Optional Passwords',
      desc: 'Protect sensitive files with secret passwords required before decryption and download.',
    },
    {
      icon: Flame,
      title: 'Download Limits & Burn',
      desc: 'Cap downloads or automatically destroy drops after the very first successful retrieval.',
    },
    {
      icon: FileCheck2,
      title: 'Automatic Cleanup',
      desc: 'Expired files and metadata are purged from backend storage to prevent lingering artifacts.',
    },
    {
      icon: ShieldCheck,
      title: 'Randomized Storage',
      desc: 'Files are stored with unpredictable UUIDs to prevent enumeration or brute-force access.',
    },
  ];

  return (
    <div className="w-full py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            How NoteDrop works
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            NoteDrop is a lightweight utility designed for temporary, frictionless file transfers. No accounts, no clutter, no permanent retention.
          </p>
        </div>

        {/* 3 Step Workflow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative p-6 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-2xl font-black text-slate-300 dark:text-slate-700">
                    {step.num}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Section */}
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-50 dark:bg-[#0d1322] border border-slate-200 dark:border-emerald-950/80 shadow-lg dark:shadow-2xl space-y-8">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Architecture & Trust
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              Built for temporary sharing
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Privacy by design. We build files to expire, not to persist.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {securityFeatures.map((item, idx) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white dark:bg-[#0a0f1d] border border-slate-200 dark:border-slate-800/80 space-y-2 shadow-sm dark:shadow-none"
                >
                  <div className="p-2 w-fit rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                    <ItemIcon className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Ready to send a file?
          </h3>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xl shadow-emerald-600/25 active:scale-[0.98] transition-all"
          >
            <span>Create a Drop</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default About;
