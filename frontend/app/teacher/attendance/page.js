'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/layout/PageHeader';
import Toast from '@/components/ui/Toast';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import AttendanceFilters from '@/components/features/attendance/AttendanceFilters';
import AttendanceRecordsTable from '@/components/features/attendance/AttendanceRecordsTable';
import EditAttendanceRecordModal from '@/components/features/attendance/EditAttendanceRecordModal';
import { teacherApi } from '@/services/api';
import { getErrorMessage } from '@/utils/errorHandler';

export default function TeacherAttendanceManagement() {
  const [assignments, setAssignments] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Edit Modal State
  const [editRecord, setEditRecord] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  useEffect(() => {
    async function loadAssignments() {
      try {
        const res = await teacherApi.getAssignments();
        setAssignments(res.data?.data || []);
      } catch (err) {
        // Non-blocking fallback
      }
    }
    loadAssignments();
  }, []);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const params = {};
      if (selectedSubject) params.subject_id = selectedSubject;
      if (selectedBatch) params.batch_id = selectedBatch;
      if (selectedStatus) params.status = selectedStatus;

      const res = await teacherApi.getAttendance(params);
      setRecords(res.data?.data || []);
    } catch (err) {
      setFetchError(getErrorMessage(err, 'Unable to load attendance records. Please retry.'));
    } finally {
      setLoading(false);
    }
  }, [selectedSubject, selectedBatch, selectedStatus]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleSaveEdit = async ({ id, status, remark }) => {
    setIsSaving(true);
    try {
      await teacherApi.updateAttendance(id, { status, remark });
      setToast({ message: 'Attendance record updated successfully!', type: 'success' });
      setEditRecord(null);
      fetchRecords();
    } catch (err) {
      setToast({
        message: getErrorMessage(err, 'Failed to update attendance record. Please try again.'),
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={['TEACHER']}>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />

      <div className="space-y-6">
        <PageHeader
          title="Attendance Records"
          description="Filter, inspect, and manually adjust student attendance status."
        />

        <AttendanceFilters
          assignments={assignments}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          selectedBatch={selectedBatch}
          setSelectedBatch={setSelectedBatch}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />

        <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden backdrop-blur-sm shadow-sm transition-colors duration-200">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton rows={5} />
            </div>
          ) : fetchError ? (
            <div className="p-6">
              <ErrorState
                title="Failed to Load Attendance Records"
                message={fetchError}
                onRetry={fetchRecords}
              />
            </div>
          ) : (
            <AttendanceRecordsTable
              records={records}
              onEdit={(rec) => setEditRecord(rec)}
            />
          )}
        </div>
      </div>

      <EditAttendanceRecordModal
        record={editRecord}
        isOpen={!!editRecord}
        onClose={() => setEditRecord(null)}
        onSave={handleSaveEdit}
        isSaving={isSaving}
      />
    </DashboardLayout>
  );
}
