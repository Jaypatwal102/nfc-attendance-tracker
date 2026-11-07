'use client';

import React from 'react';

/**
 * Filter dropdowns for Attendance Records page (Subject, Batch, Status).
 */
export default function AttendanceFilters({
  assignments = [],
  selectedSubject,
  setSelectedSubject,
  selectedBatch,
  setSelectedBatch,
  selectedStatus,
  setSelectedStatus,
}) {
  const uniqueSubjects = Array.from(
    new Set(assignments.map((a) => a.subject?.id).filter(Boolean))
  );
  const uniqueBatches = Array.from(
    new Set(assignments.map((a) => a.batch?.id).filter(Boolean))
  );

  return (
    <div className="bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-wrap gap-4 items-center transition-colors duration-200">
      <div className="flex-1 min-w-[180px]">
        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
          Filter Subject
        </label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
        >
          <option value="">All Assigned Subjects</option>
          {uniqueSubjects.map((subId) => {
            const sub = assignments.find((a) => a.subject?.id === subId)?.subject;
            return (
              <option key={sub.id} value={sub.id}>
                {sub.course_code || sub.courseCode} - {sub.name}
              </option>
            );
          })}
        </select>
      </div>

      <div className="flex-1 min-w-[180px]">
        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
          Filter Batch
        </label>
        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
        >
          <option value="">All Assigned Batches</option>
          {uniqueBatches.map((batchId) => {
            const b = assignments.find((a) => a.batch?.id === batchId)?.batch;
            return (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            );
          })}
        </select>
      </div>

      <div className="w-40">
        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
          Filter Status
        </label>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
        >
          <option value="">All Statuses</option>
          <option value="PRESENT">PRESENT</option>
          <option value="ABSENT">ABSENT</option>
        </select>
      </div>
    </div>
  );
}

