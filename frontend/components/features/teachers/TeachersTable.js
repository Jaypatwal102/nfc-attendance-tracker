'use client';

import React from 'react';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

/**
 * Teachers table component.
 */
export default function TeachersTable({ teachers = [] }) {
  if (teachers.length === 0) {
    return (
      <EmptyState
        title="No teachers registered"
        description="Click 'Add New Teacher' to create a teacher account."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
        <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700/60">
          <tr>
            <th className="px-6 py-3.5">Employee ID</th>
            <th className="px-6 py-3.5">Full Name</th>
            <th className="px-6 py-3.5">Email Address</th>
            <th className="px-6 py-3.5 text-center">Account Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
          {teachers.map((t) => (
            <tr
              key={t.id}
              className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition"
            >
              <td className="px-6 py-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                {t.employeeId}
              </td>
              <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                {t.name}
              </td>
              <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                {t.email}
              </td>
              <td className="px-6 py-4 text-center">
                <Badge variant={t.user?.isActive ? 'active' : 'inactive'}>
                  {t.user?.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

