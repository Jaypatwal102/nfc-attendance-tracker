'use client';

import React from 'react';
import Button from '@/components/ui/Button';

/**
 * Form to map a teacher to a subject and batch.
 */
export default function TeacherAssignmentForm({
  teachers = [],
  subjects = [],
  batches = [],
  selectedTeacher,
  setSelectedTeacher,
  selectedSubject,
  setSelectedSubject,
  selectedBatch,
  setSelectedBatch,
  onSubmit,
  isAssigning,
}) {
  return (
    <div className="bg-white dark:bg-slate-800/80 p-6 rounded-xl border border-slate-200 dark:border-slate-700/60 backdrop-blur-sm shadow-sm transition-colors duration-200">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-700/60 pb-3">
        Assign Teacher to Subject & Batch
      </h3>

      <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Select Teacher
          </label>
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            required
          >
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.employeeId})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Select Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            required
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.courseCode || s.course_code} - {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Select Batch
          </label>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            required
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.program})
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <Button
            type="submit"
            disabled={isAssigning}
            loading={isAssigning}
            className="w-full"
          >
            Assign Teacher
          </Button>
        </div>
      </form>
    </div>
  );
}

