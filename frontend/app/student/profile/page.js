'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/layout/PageHeader';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import StudentProfileCard from '@/components/features/students/StudentProfileCard';
import { studentApi } from '@/services/api';
import { getErrorMessage } from '@/utils/errorHandler';

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await studentApi.getProfile();
      setProfile(res.data?.data || null);
    } catch (err) {
      setFetchError(
        getErrorMessage(
          err,
          'Unable to load your student profile. Please check connection and retry.'
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return (
    <DashboardLayout allowedRoles={['STUDENT']}>
      <div className="max-w-3xl space-y-6">
        <PageHeader
          title="Student Profile"
          description="Personal information and active academic batch enrollment."
        />

        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : fetchError ? (
          <ErrorState
            title="Failed to Load Profile"
            message={fetchError}
            onRetry={loadProfile}
          />
        ) : (
          <StudentProfileCard profile={profile} />
        )}
      </div>
    </DashboardLayout>
  );
}
