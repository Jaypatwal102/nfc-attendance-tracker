'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/layout/PageHeader';
import StatCard from '@/components/ui/StatCard';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import RecentSessionsTable from '@/components/features/dashboard/RecentSessionsTable';
import { teacherApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils/errorHandler';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [assignRes, sessRes] = await Promise.all([
        teacherApi.getAssignments(),
        teacherApi.getSessions(),
      ]);
      setAssignments(assignRes.data?.data || []);
      setSessions(sessRes.data?.data || []);
    } catch (err) {
      setFetchError(
        getErrorMessage(
          err,
          'Unable to load your teaching assignments and recent sessions. Please retry.'
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const teacherName = user?.teacher?.name || user?.email?.split('@')[0] || 'Teacher';
  const uniqueSubjectsCount = new Set(assignments.map((a) => a.subject?.id)).size;
  const uniqueBatchesCount = new Set(assignments.map((a) => a.batch?.id)).size;

  const headerActions = (
    <div className="flex gap-2.5 sm:gap-3">
      <Link
        href="/teacher/attendance/take"
        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/20 flex items-center gap-2"
      >
        <span>📲</span>
        <span>Take Attendance</span>
      </Link>
      <Link
        href="/teacher/low-attendance"
        className="px-4 py-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-900/60 font-semibold text-xs transition flex items-center gap-2 shadow-2xs"
      >
        <span>⚠️</span>
        <span>Low Attendance</span>
      </Link>
    </div>
  );

  return (
    <DashboardLayout allowedRoles={['TEACHER']}>
      <div className="space-y-6">
        <PageHeader
          title={`Welcome, ${teacherName} 👨‍🏫`}
          description="Manage class sessions, scan NFC cards, and monitor attendance statistics."
          actions={headerActions}
        />

        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : fetchError ? (
          <ErrorState
            title="Failed to Load Dashboard"
            message={fetchError}
            onRetry={loadData}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                title="Assigned Subjects"
                value={uniqueSubjectsCount}
                color="indigo"
              />
              <StatCard
                title="Assigned Batches"
                value={uniqueBatchesCount}
                color="sky"
              />
              <StatCard
                title="Total Sessions Conducted"
                value={sessions.length}
                color="emerald"
              />
            </div>

            <RecentSessionsTable sessions={sessions} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
