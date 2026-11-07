'use client';

import React from 'react';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

/**
 * Table displaying subject-wise attendance breakdown percentages on the student dashboard.
 */
export default function SubjectBreakdownTable({ subjects = [] }) {
  if (!subjects || subjects.length === 0) {
    return (
      <EmptyState
        title="No subject mappings found"
        description="You are currently not enrolled in any subjects."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
        <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700/60">
          <tr>
            <th className="px-6 py-3.5">Course Code</th>
            <th className="px-6 py-3.5">Subject Name</th>
            <th className="px-6 py-3.5 text-right">Total Classes</th>
            <th className="px-6 py-3.5 text-right">Present</th>
            <th className="px-6 py-3.5 text-right">Absent</th>
            <th className="px-6 py-3.5 text-right">Attendance %</th>
            <th className="px-6 py-3.5 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
          {subjects.map((sub) => {
            const isLow = sub.percentage < 75;
            return (
              <tr
                key={sub.subject_id}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition"
              >
                <td className="px-6 py-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                  {sub.course_code}
                </td>
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                  {sub.subject_name}
                </td>
                <td className="px-6 py-4 text-right font-medium text-slate-700 dark:text-slate-300">
                  {sub.total_sessions}
                </td>
                <td className="px-6 py-4 text-right font-medium text-emerald-600 dark:text-emerald-400">
                  {sub.present}
                </td>
                <td className="px-6 py-4 text-right font-medium text-rose-600 dark:text-rose-400">
                  {sub.absent}
                </td>
                <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-slate-100">
                  {sub.percentage}%
                </td>
                <td className="px-6 py-4 text-center">
                  <Badge variant={isLow ? 'absent' : 'present'}>
                    {isLow ? 'Low Attendance' : 'Good'}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

