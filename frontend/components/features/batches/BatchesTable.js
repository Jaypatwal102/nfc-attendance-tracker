'use client';

import React from 'react';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

/**
 * Batches directory table.
 */
export default function BatchesTable({ batches = [] }) {
  if (batches.length === 0) {
    return (
      <EmptyState
        title="No batches registered"
        description="Click 'Add New Batch' to create a batch."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
        <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700/60">
          <tr>
            <th className="px-6 py-3.5">Batch Identifier</th>
            <th className="px-6 py-3.5">Program</th>
            <th className="px-6 py-3.5 text-center">Admission Year</th>
            <th className="px-6 py-3.5 text-center">Semester</th>
            <th className="px-6 py-3.5 text-center">Section</th>
            <th className="px-6 py-3.5 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
          {batches.map((b) => (
            <tr
              key={b.id}
              className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition"
            >
              <td className="px-6 py-4 font-semibold text-indigo-600 dark:text-indigo-400">
                {b.name}
              </td>
              <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                {b.program}
              </td>
              <td className="px-6 py-4 text-center font-mono">{b.admissionYear}</td>
              <td className="px-6 py-4 text-center font-semibold text-slate-800 dark:text-slate-200">
                Semester {b.semester}
              </td>
              <td className="px-6 py-4 text-center font-mono">{b.section || '—'}</td>
              <td className="px-6 py-4 text-center">
                <Badge variant={b.isActive ? 'active' : 'inactive'}>
                  {b.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

