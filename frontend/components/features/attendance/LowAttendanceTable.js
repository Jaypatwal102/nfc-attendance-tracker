'use client';

import React from 'react';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

/**
 * Table displaying students whose attendance percentage is below the threshold.
 */
export default function LowAttendanceTable({ students = [], threshold = 75 }) {
  if (students.length === 0) {
    return (
      <EmptyState
        title="No low attendance students"
        description={`Great news! All enrolled students have attendance above ${threshold}%.`}
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
        <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700/60">
          <tr>
            <th className="px-6 py-3.5">Student Name</th>
            <th className="px-6 py-3.5">Enrollment No</th>
            <th className="px-6 py-3.5">Email</th>
            <th className="px-6 py-3.5 text-right">Present</th>
            <th className="px-6 py-3.5 text-right">Total Sessions</th>
            <th className="px-6 py-3.5 text-right">Attendance %</th>
            <th className="px-6 py-3.5 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
          {students.map((st) => (
            <tr
              key={st.studentId}
              className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition"
            >
              <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                {st.studentName}
              </td>
              <td className="px-6 py-4 font-mono text-indigo-600 dark:text-indigo-400">
                {st.enrollmentNo}
              </td>
              <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                {st.email}
              </td>
              <td className="px-6 py-4 text-right font-medium text-emerald-600 dark:text-emerald-400">
                {st.presentSessions}
              </td>
              <td className="px-6 py-4 text-right font-medium text-slate-700 dark:text-slate-300">
                {st.totalSessions}
              </td>
              <td className="px-6 py-4 text-right font-bold text-rose-600 dark:text-rose-400">
                {st.attendancePercentage}%
              </td>
              <td className="px-6 py-4 text-center">
                <Badge variant="absent">Below {threshold}%</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

