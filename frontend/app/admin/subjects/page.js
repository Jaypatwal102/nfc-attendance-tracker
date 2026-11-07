'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import SubjectsTable from '@/components/features/subjects/SubjectsTable';
import AddSubjectModal from '@/components/features/subjects/AddSubjectModal';
import { adminApi, publicApi } from '@/services/api';
import { getErrorMessage } from '@/utils/errorHandler';

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await publicApi.getSubjects();
      setSubjects(res.data?.data || []);
    } catch (err) {
      setFetchError(getErrorMessage(err, 'Unable to load subjects directory. Please retry.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleAddSubject = async (data) => {
    setIsSubmitting(true);
    try {
      await adminApi.createSubject(data);
      setToast({ message: 'Subject created successfully!', type: 'success' });
      setIsAddOpen(false);
      fetchSubjects();
    } catch (err) {
      setToast({
        message: getErrorMessage(err, 'Failed to create subject. Please check inputs and retry.'),
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (subject) => {
    try {
      const newStatus = !subject.isActive;
      await adminApi.updateSubjectStatus(subject.id, newStatus);
      setToast({
        message: `Subject ${subject.courseCode || subject.course_code} ${
          newStatus ? 'activated' : 'deactivated'
        } successfully!`,
        type: 'success',
      });
      fetchSubjects();
    } catch (err) {
      setToast({
        message: getErrorMessage(err, 'Failed to update subject status.'),
        type: 'error',
      });
    }
  };

  const headerActions = (
    <Button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2">
      <span>📚</span>
      <span>Add New Subject</span>
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
          title="Subject Management"
          description="Create academic courses and configure subject status."
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
                title="Failed to Load Subjects"
                message={fetchError}
                onRetry={fetchSubjects}
              />
            </div>
          ) : (
            <SubjectsTable subjects={subjects} onToggleStatus={handleToggleStatus} />
          )}
        </div>
      </div>

      <AddSubjectModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddSubject={handleAddSubject}
        isSubmitting={isSubmitting}
      />
    </DashboardLayout>
  );
}
