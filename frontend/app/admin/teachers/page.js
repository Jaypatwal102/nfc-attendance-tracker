'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import TeachersTable from '@/components/features/teachers/TeachersTable';
import AddTeacherModal from '@/components/features/teachers/AddTeacherModal';
import { adminApi } from '@/services/api';
import { getErrorMessage } from '@/utils/errorHandler';

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await adminApi.getTeachers();
      setTeachers(res.data?.data || []);
    } catch (err) {
      setFetchError(getErrorMessage(err, 'Unable to load teachers directory. Please retry.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleAddTeacher = async (data) => {
    setIsSubmitting(true);
    try {
      await adminApi.createTeacher(data);
      setToast({ message: 'Teacher profile created successfully!', type: 'success' });
      setIsAddOpen(false);
      fetchTeachers();
    } catch (err) {
      setToast({
        message: getErrorMessage(err, 'Failed to create teacher account. Please try again.'),
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const headerActions = (
    <Button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2">
      <span>➕</span>
      <span>Add New Teacher</span>
    </Button>
  );

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />

      <div className="space-y-6">
        <PageHeader
          title="Teachers Directory"
          description="Manage faculty members and register new teacher accounts."
          actions={headerActions}
        />

        <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden backdrop-blur-sm shadow-sm transition-colors duration-200">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton rows={5} />
            </div>
          ) : fetchError ? (
            <div className="p-6">
              <ErrorState
                title="Failed to Load Teachers"
                message={fetchError}
                onRetry={fetchTeachers}
              />
            </div>
          ) : (
            <TeachersTable teachers={teachers} />
          )}
        </div>
      </div>

      <AddTeacherModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddTeacher={handleAddTeacher}
        isSubmitting={isSubmitting}
      />
    </DashboardLayout>
  );
}
