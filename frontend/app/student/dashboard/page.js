'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/layout/PageHeader';
import StatCard from '@/components/ui/StatCard';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import SubjectBreakdownTable from '@/components/features/students/SubjectBreakdownTable';
import { studentApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/utils/errorHandler';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await studentApi.getSummary();
      setSummary(res.data?.data || null);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Unable to load your attendance summary. Please check your connection and retry.'
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const studentName = user?.student?.name || user?.email?.split('@')[0] || 'Student';

  return (
    <DashboardLayout allowedRoles={['STUDENT']}>
      <div className="space-y-6">
        <PageHeader
          title={`Welcome back, ${studentName} 👋`}
          description="Track your course attendance metrics and academic progress."
        />

        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : error ? (
          <ErrorState
            title="Failed to Load Attendance Summary"
            message={error}
            onRetry={fetchSummary}
          />
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Overall Attendance"
                value={`${summary?.overall_percentage ?? 0}%`}
                subtitle="Required minimum: 75%"
                color={
                  (summary?.overall_percentage ?? 0) >= 75
                    ? 'emerald'
                    : 'rose'
                }
              />
              <StatCard
                title="Total Classes"
                value={summary?.total_classes ?? 0}
                color="indigo"
              />
              <StatCard
                title="Present"
                value={summary?.present ?? 0}
                color="emerald"
              />
              <StatCard
                title="Absent"
                value={summary?.absent ?? 0}
                color="rose"
              />
            </div>

            {/* Subject-wise Attendance Breakdown */}
            <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden backdrop-blur-sm shadow-sm transition-colors duration-200">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Subject-wise Attendance Breakdown
                </h3>
              </div>

              <SubjectBreakdownTable subjects={summary?.subjects} />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
