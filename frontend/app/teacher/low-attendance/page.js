'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import LowAttendanceFilters from '@/components/features/attendance/LowAttendanceFilters';
import LowAttendanceTable from '@/components/features/attendance/LowAttendanceTable';
import SendWarningEmailModal from '@/components/features/attendance/SendWarningEmailModal';
import { teacherApi } from '@/services/api';
import { getErrorMessage } from '@/utils/errorHandler';

export default function LowAttendancePage() {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [students, setStudents] = useState([]);
  const [threshold, setThreshold] = useState(75);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Email action state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

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
      setFetchError(getErrorMessage(err, 'Unable to load your teaching assignments.'));
    }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const fetchLowAttendance = useCallback(async () => {
    if (!selectedAssignment) return;
    const [subjectId, batchId] = selectedAssignment.split('|');

    setLoading(true);
    setFetchError(null);
    try {
      const res = await teacherApi.getLowAttendance({
        subject_id: subjectId,
        batch_id: batchId,
        threshold,
      });
      setStudents(res.data?.data || []);
    } catch (err) {
      setFetchError(
        getErrorMessage(
          err,
          'Unable to calculate low attendance students. Please check connection and retry.'
        )
      );
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [selectedAssignment, threshold]);

  useEffect(() => {
    fetchLowAttendance();
  }, [fetchLowAttendance]);

  const handleSendEmails = async () => {
    if (!selectedAssignment) return;
    const [subjectId, batchId] = selectedAssignment.split('|');

    setIsSending(true);
    try {
      const res = await teacherApi.sendLowAttendanceEmail({
        subject_id: subjectId,
        batch_id: batchId,
      });

      const data = res.data?.data;
      setToast({
        message: `Successfully dispatched ${data?.emails_sent || 0} low-attendance warning emails!`,
        type: 'success',
      });
      setIsConfirmOpen(false);
    } catch (err) {
      setToast({
        message: getErrorMessage(
          err,
          'Failed to dispatch warning emails. Please check the email service configuration.'
        ),
        type: 'error',
      });
    } finally {
      setIsSending(false);
    }
  };

  const headerActions =
    students.length > 0 ? (
      <Button
        variant="danger"
        onClick={() => setIsConfirmOpen(true)}
        className="flex items-center gap-2"
      >
        <span>📧</span>
        <span>Send Mail to Low Attendance Students</span>
      </Button>
    ) : null;

  return (
    <DashboardLayout allowedRoles={['TEACHER']}>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />

      <div className="space-y-6">
        <PageHeader
          title="Low Attendance Warnings"
          description="Identify students below the threshold and dispatch automated warning emails."
          actions={headerActions}
        />

        <LowAttendanceFilters
          assignments={assignments}
          selectedAssignment={selectedAssignment}
          setSelectedAssignment={setSelectedAssignment}
          threshold={threshold}
          setThreshold={setThreshold}
        />

        <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden backdrop-blur-sm shadow-sm transition-colors duration-200">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton rows={4} />
            </div>
          ) : fetchError ? (
            <div className="p-6">
              <ErrorState
                title="Failed to Load Low Attendance Records"
                message={fetchError}
                onRetry={fetchLowAttendance}
              />
            </div>
          ) : (
            <LowAttendanceTable students={students} threshold={threshold} />
          )}
        </div>
      </div>

      <SendWarningEmailModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleSendEmails}
        studentCount={students.length}
        threshold={threshold}
        isSending={isSending}
      />
    </DashboardLayout>
  );
}
