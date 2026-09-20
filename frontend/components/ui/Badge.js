'use client';

import React from 'react';

export default function Badge({ variant = 'default', children, className = '' }) {
  const styles = {
    default: 'bg-slate-700 text-slate-300 border-slate-600',
    present: 'bg-emerald-950/70 text-emerald-400 border-emerald-800/80',
    absent: 'bg-rose-950/70 text-rose-400 border-rose-800/80',
    active: 'bg-blue-950/70 text-blue-400 border-blue-800/80',
    inactive: 'bg-amber-950/70 text-amber-400 border-amber-800/80',
    warning: 'bg-amber-950/70 text-amber-400 border-amber-800/80',
    admin: 'bg-purple-950/70 text-purple-400 border-purple-800/80',
    teacher: 'bg-indigo-950/70 text-indigo-400 border-indigo-800/80',
    student: 'bg-teal-950/70 text-teal-400 border-teal-800/80',
  };

  const currentStyle = styles[variant?.toLowerCase()] || styles.default;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStyle} ${className}`}
    >
      {children}
    </span>
  );
}
