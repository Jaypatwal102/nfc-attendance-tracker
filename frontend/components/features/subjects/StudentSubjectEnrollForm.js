'use client';

import React from 'react';
import Button from '@/components/ui/Button';

/**
 * Form to enroll a student into an academic subject and batch.
 */
export default function StudentSubjectEnrollForm({
  students = [],
  subjects = [],
  batches = [],
  selectedStudent,
  onStudentChange,
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
        Enroll Student into Subject
      </h3>

      <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Select Student
          </label>
          <select
            value={selectedStudent}
            onChange={(e) => onStudentChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            required
          >
            {students.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name} ({st.enrollmentNo})
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
            Enrolled Batch
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
            Enroll Student
          </Button>
        </div>
      </form>
    </div>
  );
}

