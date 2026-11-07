'use client';

import React from 'react';

/**
 * Top card during an active attendance session showing session details, live indicator,
 * unsynced offline records badge, retry sync button, and end session button.
 */
export default function ActiveSessionHeader({
  session,
  pendingCount = 0,
  isSyncing = false,
  onSyncPending,
  onEndSession,
}) {
  if (!session) return null;

  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 p-6 backdrop-blur-sm shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors duration-200">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            SESSION ACTIVE
          </span>
          {pendingCount > 0 && (
            <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
              {pendingCount} saved offline
            </span>
          )}
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {session.subject?.name} ({session.subject?.courseCode || session.subject?.course_code})
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Batch: <strong>{session.batch?.name}</strong> | Date:{' '}
          {new Date(session.sessionDate).toLocaleDateString()}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {pendingCount > 0 && (
          <button
            onClick={onSyncPending}
            disabled={isSyncing}
            className="px-3.5 py-2 rounded-lg bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-200 text-xs font-semibold transition"
          >
            {isSyncing ? 'Syncing...' : `Retry Sync (${pendingCount})`}
          </button>
        )}
        <button
          onClick={onEndSession}
          className="px-4 py-2 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-900/60 font-semibold text-xs transition shadow-2xs"
        >
          End Session
        </button>
      </div>
    </div>
  );
}

