'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/layout/PageHeader';
import Toast from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import StudentSubjectEnrollForm from '@/components/features/subjects/StudentSubjectEnrollForm';
import StudentSubjectEnrollTable from '@/components/features/subjects/StudentSubjectEnrollTable';
import { adminApi, publicApi } from '@/services/api';
import { getErrorMessage } from '@/utils/errorHandler';

export default function AdminStudentSubjectsPage() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [batches, setBatches] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Form State
  const [selectedStudent, setSelectedStudent] = useState('');
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
      const [studRes, subRes, batchRes, mapRes] = await Promise.all([
        adminApi.getStudents(),
        publicApi.getSubjects(),
        publicApi.getBatches(),
        adminApi.getStudentSubjectMappings(),
      ]);

      const allStudents = studRes.data?.data || [];
      const allSubjects = subRes.data?.data || [];
      const allBatches = batchRes.data?.data || [];
      const allMappings = mapRes.data?.data || [];

      setStudents(allStudents);
      setSubjects(allSubjects);
      setBatches(allBatches);
      setMappings(allMappings);

      if (allStudents.length > 0) {
        setSelectedStudent((prev) => prev || allStudents[0].id);
        if (allStudents[0].batchId) setSelectedBatch((prev) => prev || allStudents[0].batchId);
      }
      if (allSubjects.length > 0) setSelectedSubject((prev) => prev || allSubjects[0].id);
      if (allBatches.length > 0 && !selectedBatch) setSelectedBatch(allBatches[0].id);
    } catch (err) {
      setFetchError(getErrorMessage(err, 'Unable to load student subject enrollment data. Please retry.'));
    } finally {
      setLoading(false);
    }
  }, [selectedBatch]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleStudentChange = (studentId) => {
    setSelectedStudent(studentId);
    const stud = students.find((s) => s.id === studentId);
    if (stud && stud.batchId) {
      setSelectedBatch(stud.batchId);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedSubject || !selectedBatch) return;
    setIsAssigning(true);

    try {
      await adminApi.assignStudentSubject({
        student_id: selectedStudent,
        subject_id: selectedSubject,
        batch_id: selectedBatch,
      });

      setToast({ message: 'Student enrolled in subject successfully!', type: 'success' });
      loadAllData();
    } catch (err) {
      setToast({
        message: getErrorMessage(
          err,
          'Failed to enroll student in subject. This enrollment may already exist.'
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
      await adminApi.deleteStudentSubjectMapping(deleteTarget.id);
      setToast({ message: 'Subject enrollment removed successfully.', type: 'success' });
      setDeleteTarget(null);
      loadAllData();
    } catch (err) {
      setToast({
        message: getErrorMessage(err, 'Failed to remove subject enrollment. Please retry.'),
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
          title="Student Subject Enrollments"
          description="Enroll students into active academic subjects for their enrolled batch."
        />

        <StudentSubjectEnrollForm
          students={students}
          subjects={subjects}
          batches={batches}
          selectedStudent={selectedStudent}
          onStudentChange={handleStudentChange}
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
              Active Student Subject Enrollments
            </h3>
          </div>

          {loading ? (
            <div className="p-6">
              <LoadingSkeleton rows={4} />
            </div>
          ) : fetchError ? (
            <div className="p-6">
              <ErrorState
                title="Failed to Load Subject Enrollments"
                message={fetchError}
                onRetry={loadAllData}
              />
            </div>
          ) : (
            <StudentSubjectEnrollTable
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
        title="Confirm Removal of Student Enrollment"
        message={
          deleteTarget
            ? `Are you sure you want to remove the enrollment for student ${deleteTarget.student?.name} in course ${
                deleteTarget.subject?.courseCode || deleteTarget.subject?.course_code
              }?`
            : ''
        }
        confirmText="Confirm Remove"
        isLoading={isDeleting}
        variant="danger"
      />
    </DashboardLayout>
  );
}
