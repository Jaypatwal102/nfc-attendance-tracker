'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/layout/PageHeader';
import Toast from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import TeacherAssignmentForm from '@/components/features/teachers/TeacherAssignmentForm';
import TeacherAssignmentsTable from '@/components/features/teachers/TeacherAssignmentsTable';
import { adminApi, publicApi } from '@/services/api';
import { getErrorMessage } from '@/utils/errorHandler';

export default function AdminTeacherAssignmentsPage() {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [batches, setBatches] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Form State
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  // Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [teachRes, subRes, batchRes, mapRes] = await Promise.all([
        adminApi.getTeachers(),
        publicApi.getSubjects(),
        publicApi.getBatches(),
        adminApi.getTeacherSubjectMappings(),
      ]);

      const tList = teachRes.data?.data || [];
      const sList = subRes.data?.data || [];
      const bList = batchRes.data?.data || [];
      const mList = mapRes.data?.data || [];

      setTeachers(tList);
      setSubjects(sList);
      setBatches(bList);
      setMappings(mList);

      if (tList.length > 0) setSelectedTeacher((prev) => prev || tList[0].id);
      if (sList.length > 0) setSelectedSubject((prev) => prev || sList[0].id);
      if (bList.length > 0) setSelectedBatch((prev) => prev || bList[0].id);
    } catch (err) {
      setFetchError(getErrorMessage(err, 'Unable to load teacher assignments data. Please retry.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedTeacher || !selectedSubject || !selectedBatch) return;
    setIsAssigning(true);

    try {
      await adminApi.assignTeacherSubject({
        teacher_id: selectedTeacher,
        subject_id: selectedSubject,
        batch_id: selectedBatch,
      });

      setToast({
        message: 'Teacher successfully assigned to subject and batch!',
        type: 'success',
      });
      loadAllData();
    } catch (err) {
      setToast({
        message: getErrorMessage(
          err,
          'Failed to assign teacher. This assignment may already exist.'
        ),
        type: 'error',
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteTeacherSubjectMapping(deleteTarget.id);
      setToast({ message: 'Assignment removed successfully.', type: 'success' });
      setDeleteTarget(null);
      loadAllData();
    } catch (err) {
      setToast({
        message: getErrorMessage(err, 'Failed to remove assignment. Please try again.'),
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />

      <div className="space-y-6">
        <PageHeader
          title="Teacher Assignments"
          description="Map faculty teachers to assigned subjects and student batches."
        />

        <TeacherAssignmentForm
          teachers={teachers}
          subjects={subjects}
          batches={batches}
          selectedTeacher={selectedTeacher}
          setSelectedTeacher={setSelectedTeacher}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          selectedBatch={selectedBatch}
          setSelectedBatch={setSelectedBatch}
          onSubmit={handleAssign}
          isAssigning={isAssigning}
        />

        <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden backdrop-blur-sm shadow-sm transition-colors duration-200">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/60">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Active Teacher Subject Mappings
            </h3>
          </div>

          {loading ? (
            <div className="p-6">
              <LoadingSkeleton rows={4} />
            </div>
          ) : fetchError ? (
            <div className="p-6">
              <ErrorState
                title="Failed to Load Assignments"
                message={fetchError}
                onRetry={loadAllData}
              />
            </div>
          ) : (
            <TeacherAssignmentsTable
              mappings={mappings}
              onDelete={(target) => setDeleteTarget(target)}
            />
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Confirm Removal of Teacher Assignment"
        message={
          deleteTarget
            ? `Are you sure you want to remove the assignment for ${deleteTarget.teacher?.name} teaching ${
                deleteTarget.subject?.courseCode || deleteTarget.subject?.course_code
              } to batch ${deleteTarget.batch?.name}?`
            : ''
        }
        confirmText="Confirm Remove"
        isLoading={isDeleting}
        variant="danger"
      />
    </DashboardLayout>
  );
}
