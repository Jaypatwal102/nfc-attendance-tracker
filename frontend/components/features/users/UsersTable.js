'use client';

import React from 'react';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

/**
 * Users directory table with role badges, status badges, and action triggers.
 */
export default function UsersTable({ users = [], onOpenRoleModal, onToggleStatus }) {
  if (users.length === 0) {
    return (
      <EmptyState
        title="No users found"
        description="No accounts match your query parameters."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
        <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700/60">
          <tr>
            <th className="px-6 py-3.5">User Email</th>
            <th className="px-6 py-3.5">Associated Profile</th>
            <th className="px-6 py-3.5 text-center">Role</th>
            <th className="px-6 py-3.5 text-center">Status</th>
            <th className="px-6 py-3.5 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
          {users.map((u) => (
            <tr
              key={u.id}
              className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition"
            >
              <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                {u.email}
              </td>
              <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                {u.teacher
                  ? `Teacher: ${u.teacher.name} (${u.teacher.employeeId})`
                  : u.student
                  ? `Student: ${u.student.name} (${u.student.enrollmentNo})`
                  : 'System Admin'}
              </td>
              <td className="px-6 py-4 text-center">
                <Badge variant={u.role.toLowerCase()}>{u.role}</Badge>
              </td>
              <td className="px-6 py-4 text-center">
                <Badge variant={u.isActive ? 'active' : 'inactive'}>
                  {u.isActive ? 'Active' : 'Deactivated'}
                </Badge>
              </td>
              <td className="px-6 py-4 text-center space-x-2">
                <button
                  onClick={() => onOpenRoleModal(u)}
                  className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/80 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900 rounded font-medium transition shadow-2xs"
                >
                  Change Role
                </button>
                <button
                  onClick={() => onToggleStatus(u)}
                  className={`px-3 py-1 rounded font-medium border transition shadow-2xs ${
                    u.isActive
                      ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800 dark:hover:bg-rose-900'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-900'
                  }`}
                >
                  {u.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

