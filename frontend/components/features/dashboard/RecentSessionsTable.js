'use client';

import React from 'react';
import Link from 'next/link';
import EmptyState from '@/components/ui/EmptyState';

/**
 * Table displaying recent attendance sessions conducted by a teacher.
 */
export default function RecentSessionsTable({ sessions = [] }) {
  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden backdrop-blur-sm shadow-sm transition-colors duration-200">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Recent Class Sessions
        </h3>
        <Link
          href="/teacher/attendance"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition"
        >
          View History →
        </Link>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          title="No sessions conducted yet"
          description="Click 'Take Attendance' to start your first NFC class session."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700/60">
              <tr>
                <th className="px-6 py-3.5">Subject</th>
                <th className="px-6 py-3.5">Batch</th>
                <th className="px-6 py-3.5">Session Date</th>
                <th className="px-6 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
              {sessions.slice(0, 5).map((sess) => (
                <tr
                  key={sess.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition"
                >
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                    <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400 mr-2">
                      {sess.subject?.courseCode || sess.subject?.course_code}
                    </span>
                    <span>{sess.subject?.name}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-semibold">
                    {sess.batch?.name}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono">
                    {new Date(sess.sessionDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      href={`/teacher/attendance?subject_id=${sess.subjectId}&batch_id=${sess.batchId}`}
                      className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded border border-indigo-200 dark:border-indigo-800/60 transition shadow-2xs"
                    >
                      View Records
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

