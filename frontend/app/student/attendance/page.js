'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/layout/PageHeader';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import StudentAttendanceTable from '@/components/features/students/StudentAttendanceTable';
import { studentApi, publicApi } from '@/services/api';
import { getErrorMessage } from '@/utils/errorHandler';

export default function StudentAttendanceHistory() {
  const [history, setHistory] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const res = await publicApi.getSubjects();
        setSubjects(res.data?.data || []);
      } catch (err) {
        // Non-blocking fallback
      }
    }
    fetchSubjects();
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const params = {};
      if (selectedSubject) params.subject_id = selectedSubject;
      if (selectedStatus) params.status = selectedStatus;

      const res = await studentApi.getAttendance(params);
      setHistory(res.data?.data || []);
    } catch (err) {
      setFetchError(
        getErrorMessage(
          err,
          'Unable to load your attendance history. Please check connection and retry.'
        )
      );
    } finally {
      setLoading(false);
    }
  }, [selectedSubject, selectedStatus]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <DashboardLayout allowedRoles={['STUDENT']}>
      <div className="space-y-6">
        <PageHeader
          title="Attendance History"
          description="Complete record of your class attendance sessions."
        />

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-wrap gap-4 items-center transition-colors duration-200">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Filter by Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            >
              <option value="">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.courseCode || sub.course_code} - {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-44">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Filter by Status
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

        <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden backdrop-blur-sm shadow-sm transition-colors duration-200">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton rows={4} />
            </div>
          ) : fetchError ? (
            <div className="p-6">
              <ErrorState
                title="Failed to Load History"
                message={fetchError}
                onRetry={fetchHistory}
              />
            </div>
          ) : (
            <StudentAttendanceTable history={history} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
