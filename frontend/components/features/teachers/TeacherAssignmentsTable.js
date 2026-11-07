'use client';

import React from 'react';
import EmptyState from '@/components/ui/EmptyState';

/**
 * Table displaying active teacher-to-subject/batch assignments.
 */
export default function TeacherAssignmentsTable({ mappings = [], onDelete }) {
  if (mappings.length === 0) {
    return (
      <EmptyState
        title="No active teacher assignments"
        description="Use the form above to assign teachers to subjects."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
        <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700/60">
          <tr>
            <th className="px-6 py-3.5">Teacher Name</th>
            <th className="px-6 py-3.5">Employee ID</th>
            <th className="px-6 py-3.5">Subject</th>
            <th className="px-6 py-3.5">Batch</th>
            <th className="px-6 py-3.5 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
          {mappings.map((m) => (
            <tr
              key={m.id}
              className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition"
            >
              <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                {m.teacher?.name}
              </td>
              <td className="px-6 py-4 font-mono text-indigo-600 dark:text-indigo-400">
                {m.teacher?.employeeId}
              </td>
              <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                {m.subject?.courseCode || m.subject?.course_code} - {m.subject?.name}
              </td>
              <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200">
                {m.batch?.name}
              </td>
              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => onDelete(m)}
                  className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/70 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-900 rounded font-medium transition shadow-2xs"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

