'use client';

import React from 'react';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

/**
 * Table displaying attendance session records with status badge and edit button.
 */
export default function AttendanceRecordsTable({ records = [], onEdit }) {
  if (records.length === 0) {
    return (
      <EmptyState
        title="No attendance records found"
        description="No records match your active search filters."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
        <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700/60">
          <tr>
            <th className="px-6 py-3.5">Student</th>
            <th className="px-6 py-3.5">Enrollment No</th>
            <th className="px-6 py-3.5">Subject</th>
            <th className="px-6 py-3.5">Batch</th>
            <th className="px-6 py-3.5">Date</th>
            <th className="px-6 py-3.5">Remark</th>
            <th className="px-6 py-3.5 text-center">Status</th>
            <th className="px-6 py-3.5 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
          {records.map((rec) => (
            <tr
              key={rec.id}
              className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition"
            >
              <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                {rec.student?.name}
              </td>
              <td className="px-6 py-4 font-mono text-indigo-600 dark:text-indigo-400">
                {rec.student?.enrollmentNo}
              </td>
              <td className="px-6 py-4 text-slate-800 dark:text-slate-200">
                {rec.session?.subject?.name}
              </td>
              <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                {rec.session?.batch?.name}
              </td>
              <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400">
                {new Date(rec.session?.sessionDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 italic text-slate-500 dark:text-slate-400">
                {rec.remark || '—'}
              </td>
              <td className="px-6 py-4 text-center">
                <Badge variant={rec.status === 'PRESENT' ? 'present' : 'absent'}>
                  {rec.status}
                </Badge>
              </td>
              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => onEdit(rec)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 font-medium rounded transition shadow-2xs"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

