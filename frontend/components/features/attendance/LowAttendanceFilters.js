'use client';

import React from 'react';
import Input from '@/components/ui/Input';

/**
 * Assignment and threshold filter bar for the Low Attendance page.
 */
export default function LowAttendanceFilters({
  assignments = [],
  selectedAssignment,
  setSelectedAssignment,
  threshold,
  setThreshold,
}) {
  return (
    <div className="bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-wrap gap-4 items-center transition-colors duration-200">
      <div className="flex-1 min-w-[220px]">
        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
          Select Course & Batch
        </label>
        <select
          value={selectedAssignment}
          onChange={(e) => setSelectedAssignment(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
        >
          {assignments.map((a) => (
            <option
              key={`${a.subject.id}|${a.batch.id}`}
              value={`${a.subject.id}|${a.batch.id}`}
            >
              {a.subject.course_code || a.subject.courseCode} - {a.subject.name} ({a.batch.name})
            </option>
          ))}
        </select>
      </div>

      <div className="w-40">
        <Input
          label="Threshold (%)"
          type="number"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          min="1"
          max="100"
        />
      </div>
    </div>
  );
}

