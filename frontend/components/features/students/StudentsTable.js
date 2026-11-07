'use client';

import React from 'react';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

/**
 * Directory table for student accounts with NFC status and edit triggers.
 */
export default function StudentsTable({ students = [], onEdit }) {
  if (students.length === 0) {
    return (
      <EmptyState
        title="No students found"
        description="No student records match your query."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
        <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700/60">
          <tr>
            <th className="px-6 py-3.5">Enrollment No</th>
            <th className="px-6 py-3.5">Full Name</th>
            <th className="px-6 py-3.5">Email</th>
            <th className="px-6 py-3.5">Batch</th>
            <th className="px-6 py-3.5 text-center">NFC Tag ID</th>
            <th className="px-6 py-3.5 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
          {students.map((st) => (
            <tr
              key={st.id}
              className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition"
            >
              <td className="px-6 py-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                {st.enrollmentNo}
              </td>
              <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                {st.name}
              </td>
              <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                {st.email}
              </td>
              <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200">
                {st.batch?.name || '—'}
              </td>
              <td className="px-6 py-4 text-center font-mono">
                {st.nfcId ? (
                  <Badge variant="present">{st.nfcId}</Badge>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500 italic">
                    Not Assigned
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => onEdit(st)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 font-medium rounded transition shadow-2xs"
                >
                  Edit Profile
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

