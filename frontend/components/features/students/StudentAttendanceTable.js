'use client';

import React from 'react';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

/**
 * Table displaying attendance session records for a student.
 */
export default function StudentAttendanceTable({ history = [] }) {
  if (history.length === 0) {
    return (
      <EmptyState
        title="No attendance records found"
        description="No attendance records match your active filter criteria."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
        <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700/60">
          <tr>
            <th className="px-6 py-3.5">Date</th>
            <th className="px-6 py-3.5">Subject</th>
            <th className="px-6 py-3.5">Teacher</th>
            <th className="px-6 py-3.5">Marked Time</th>
            <th className="px-6 py-3.5">Remark</th>
            <th className="px-6 py-3.5 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
          {history.map((record) => (
            <tr
              key={record.id}
              className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition"
            >
              <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                {new Date(record.date).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </td>
              <td className="px-6 py-4">
                <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400 mr-2">
                  {record.subject_code}
                </span>
                <span className="text-slate-900 dark:text-slate-100 font-medium">
                  {record.subject_name}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                {record.teacher_name}
              </td>
              <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono">
                {new Date(record.marked_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className="px-6 py-4 text-slate-500 dark:text-slate-400 italic">
                {record.remark || '—'}
              </td>
              <td className="px-6 py-4 text-center">
                <Badge variant={record.status === 'PRESENT' ? 'present' : 'absent'}>
                  {record.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

