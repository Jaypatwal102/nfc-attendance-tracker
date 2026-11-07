'use client';

import React from 'react';

export default function LoadingSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-12 bg-slate-200/80 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700/50"></div>
      ))}
    </div>
  );
}
