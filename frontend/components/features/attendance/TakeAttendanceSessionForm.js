'use client';

import React from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

/**
 * Step 1 form to configure and initiate an active NFC class session.
 */
export default function TakeAttendanceSessionForm({
  assignments = [],
  selectedAssignment,
  setSelectedAssignment,
  sessionDate,
  setSessionDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  onSubmit,
  loadingAssignments,
}) {
  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 p-6 backdrop-blur-sm shadow-sm transition-colors duration-200">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-700/60 pb-3">
        1. Select Assignment & Schedule Session
      </h3>

      {loadingAssignments ? (
        <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
          Loading assignments...
        </div>
      ) : assignments.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
          No teaching assignments found. Please contact an administrator to assign subjects and
          batches to your account.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Subject & Batch Assignment
            </label>
            <select
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
              required
            >
              {assignments.map((a) => (
                <option
                  key={`${a.subject.id}|${a.batch.id}`}
                  value={`${a.subject.id}|${a.batch.id}`}
                >
                  {a.subject.course_code || a.subject.courseCode} - {a.subject.name} (Batch:{' '}
                  {a.batch.name})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Session Date"
              type="date"
              required
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
            />
            <Input
              label="Start Time"
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <Input
              label="End Time"
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full">
            Start Active Attendance Session →
          </Button>
        </form>
      )}
    </div>
  );
}

