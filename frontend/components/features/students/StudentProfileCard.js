'use client';

import React from 'react';

/**
 * Card displaying detailed student profile information and batch allocations.
 */
export default function StudentProfileCard({ profile }) {
  if (!profile) return null;

  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 p-6 space-y-6 backdrop-blur-sm shadow-sm transition-colors duration-200">
      <div className="flex items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-700/60">
        <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-200 dark:bg-indigo-600/20 dark:border-indigo-500/30 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 text-xl shadow-xs">
          {(profile?.name?.[0] || 'S').toUpperCase()}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {profile?.name}
          </h3>
          <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
            Enrollment: {profile?.enrollment_no}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
        <div>
          <span className="block font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Email Address
          </span>
          <span className="text-slate-900 dark:text-slate-100 font-medium">
            {profile?.email}
          </span>
        </div>

        <div>
          <span className="block font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Active Batch
          </span>
          <span className="text-slate-900 dark:text-slate-100 font-medium">
            {profile?.batch?.name || 'Unassigned'}
          </span>
        </div>

        <div>
          <span className="block font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Program
          </span>
          <span className="text-slate-900 dark:text-slate-100 font-medium">
            {profile?.batch?.program || '—'}
          </span>
        </div>

        <div>
          <span className="block font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Current Semester
          </span>
          <span className="text-slate-900 dark:text-slate-100 font-medium">
            Semester {profile?.batch?.semester || '—'}{' '}
            {profile?.batch?.section ? `(Section ${profile.batch.section})` : '(General)'}
          </span>
        </div>
      </div>
    </div>
  );
}

