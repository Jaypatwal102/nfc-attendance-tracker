'use client';

import React from 'react';
import Link from 'next/link';

const ACTIONS = [
  {
    href: '/admin/users',
    icon: '👥',
    title: 'Manage Users & Roles',
    description: 'Promote users to Teacher/Admin and activate/deactivate accounts.',
  },
  {
    href: '/admin/teachers',
    icon: '👨‍🏫',
    title: 'Add & View Teachers',
    description: 'Register faculty members with Employee IDs and profiles.',
  },
  {
    href: '/admin/teacher-assignments',
    icon: '🔗',
    title: 'Teacher Assignments',
    description: 'Assign teachers to specific subjects and student batches.',
  },
  {
    href: '/admin/student-subjects',
    icon: '📖',
    title: 'Student Subject Enrollments',
    description: 'Map students to their active curriculum courses.',
  },
];

/**
 * Grid of quick action links for administrators.
 */
export default function AdminQuickActions() {
  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 p-6 backdrop-blur-sm shadow-sm transition-colors duration-200">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-700/60 pb-3">
        Quick Administrative Actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-900/80 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-500/50 transition group"
          >
            <span className="text-2xl block mb-2">{action.icon}</span>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
              {action.title}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {action.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

