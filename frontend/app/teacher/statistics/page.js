'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/layout/PageHeader';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import TeacherStatsCards from '@/components/features/attendance/TeacherStatsCards';
import { teacherApi } from '@/services/api';
import { getErrorMessage } from '@/utils/errorHandler';

export default function TeacherStatisticsPage() {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const loadAssignments = useCallback(async () => {
    try {
      const res = await teacherApi.getAssignments();
      const list = res.data?.data || [];
      setAssignments(list);
      if (list.length > 0) {
        const first = list[0];
        setSelectedAssignment((prev) => prev || `${first.subject.id}|${first.batch.id}`);
      }
    } catch (err) {
      setFetchError(getErrorMessage(err, 'Unable to load course assignments.'));
    }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const fetchStats = useCallback(async () => {
    if (!selectedAssignment) return;
    const [subjectId, batchId] = selectedAssignment.split('|');

    setLoading(true);
    setFetchError(null);
    try {
      const res = await teacherApi.getStatistics({
        subject_id: subjectId,
        batch_id: batchId,
      });
      setStats(res.data?.data || null);
    } catch (err) {
      setFetchError(
        getErrorMessage(
          err,
          'Unable to calculate attendance statistics for this course and batch. Please retry.'
        )
      );
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [selectedAssignment]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <DashboardLayout allowedRoles={['TEACHER']}>
      <div className="space-y-6">
        <PageHeader
          title="Attendance Statistics"
          description="Aggregate stats and attendance performance metrics for your courses."
        />

        {/* Assignment Selector */}
        <div className="bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 max-w-xl shadow-sm transition-colors duration-200">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Select Course & Batch Assignment
          </label>
          <select
            value={selectedAssignment}
            onChange={(e) => setSelectedAssignment(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
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

        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : fetchError ? (
          <ErrorState
            title="Failed to Load Statistics"
            message={fetchError}
            onRetry={fetchStats}
          />
        ) : (
          <TeacherStatsCards stats={stats} />
        )}
      </div>
    </DashboardLayout>
  );
}
