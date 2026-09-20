'use client';

import React from 'react';

export default function StatCard({ title, value, icon: Icon, subtitle, color = 'indigo' }) {
  const colorMap = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    sky: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  };

  const iconStyle = colorMap[color] || colorMap.indigo;

  return (
    <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700/60 backdrop-blur-sm shadow-sm flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-100 tracking-tight">{value}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {Icon && (
        <div className={`p-2.5 rounded-lg border ${iconStyle}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}
