'use client';

import React from 'react';

export default function EmptyState({ title = 'No data found', description = 'There are no records matching your criteria.' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-800/40 rounded-xl border border-slate-700/50 my-4">
      <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 mb-3 text-xl">
        📂
      </div>
      <h4 className="text-base font-medium text-slate-200">{title}</h4>
      <p className="text-xs text-slate-400 max-w-sm mt-1">{description}</p>
    </div>
  );
}
