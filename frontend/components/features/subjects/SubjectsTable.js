'use client';

import React from 'react';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

/**
 * Academic subjects directory table.
 */
export default function SubjectsTable({ subjects = [], onToggleStatus }) {
  if (subjects.length === 0) {
    return (
      <EmptyState
        title="No subjects registered"
        description="Click 'Add New Subject' to create a course."
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
            <th className="px-6 py-3.5">Description</th>
            <th className="px-6 py-3.5 text-center">Status</th>
            <th className="px-6 py-3.5 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
          {subjects.map((sub) => (
            <tr
              key={sub.id}
              className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition"
            >
              <td className="px-6 py-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                {sub.courseCode || sub.course_code}
              </td>
              <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                {sub.name}
              </td>
              <td className="px-6 py-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                {sub.description || '—'}
              </td>
              <td className="px-6 py-4 text-center">
                <Badge variant={sub.isActive ? 'active' : 'inactive'}>
                  {sub.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => onToggleStatus(sub)}
                  className={`px-3 py-1 rounded font-medium border transition shadow-2xs ${
                    sub.isActive
                      ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800 dark:hover:bg-rose-900'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-900'
                  }`}
                >
                  {sub.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

