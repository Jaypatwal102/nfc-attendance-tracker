'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/layout/PageHeader';
import StatCard from '@/components/ui/StatCard';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import AdminQuickActions from '@/components/features/dashboard/AdminQuickActions';
import { adminApi, publicApi } from '@/services/api';
import { getErrorMessage } from '@/utils/errorHandler';

export default function AdminDashboard() {
  const [counts, setCounts] = useState({
    users: 0,
    teachers: 0,
    students: 0,
    subjects: 0,
    batches: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSystemStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, teachRes, studRes, subRes, batchRes] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getTeachers(),
        adminApi.getStudents(),
        publicApi.getSubjects(),
        publicApi.getBatches(),
      ]);

      setCounts({
        users: usersRes.data?.data?.length || 0,
        teachers: teachRes.data?.data?.length || 0,
        students: studRes.data?.data?.length || 0,
        subjects: subRes.data?.data?.length || 0,
        batches: batchRes.data?.data?.length || 0,
      });
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Unable to load system overview statistics. Please check server connection.'
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSystemStats();
  }, [loadSystemStats]);

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <PageHeader
          title="Administrator Control Center"
          description="System overview, user role management, and academic configuration."
        />

        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : error ? (
          <ErrorState
            title="Failed to Load Dashboard Statistics"
            message={error}
            onRetry={loadSystemStats}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard title="Total Users" value={counts.users} color="indigo" />
              <StatCard title="Teachers" value={counts.teachers} color="sky" />
              <StatCard title="Students" value={counts.students} color="emerald" />
              <StatCard title="Subjects" value={counts.subjects} color="amber" />
              <StatCard title="Batches" value={counts.batches} color="rose" />
            </div>

            <AdminQuickActions />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
