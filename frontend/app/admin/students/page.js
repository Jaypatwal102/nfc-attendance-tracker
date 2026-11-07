'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import StudentsTable from '@/components/features/students/StudentsTable';
import EditStudentModal from '@/components/features/students/EditStudentModal';
import { adminApi, publicApi } from '@/services/api';
import { getErrorMessage } from '@/utils/errorHandler';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Edit Modal State
  const [editStudent, setEditStudent] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const fetchBatches = async () => {
    try {
      const res = await publicApi.getBatches();
      setBatches(res.data?.data || []);
    } catch (err) {
      // Non-blocking fallback
    }
  };

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const params = {};
      if (selectedBatch) params.batch_id = selectedBatch;
      if (search) params.search = search;

      const res = await adminApi.getStudents(params);
      setStudents(res.data?.data || []);
    } catch (err) {
      setFetchError(getErrorMessage(err, 'Unable to load students directory. Please retry.'));
    } finally {
      setLoading(false);
    }
  }, [selectedBatch, search]);

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleSaveEdit = async ({ id, name, nfc_id, batch_id }) => {
    setIsSaving(true);
    try {
      await adminApi.updateStudent(id, { name, nfc_id, batch_id });
      setToast({ message: `Updated student ${name} successfully!`, type: 'success' });
      setEditStudent(null);
      fetchStudents();
    } catch (err) {
      setToast({
        message: getErrorMessage(err, 'Failed to update student profile. Please try again.'),
        type: 'error',
      });
    } finally {
      setIsSaving(false);
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
          title="Students Directory"
          description="Manage enrolled students, assign NFC ID tags, and update batch allocations."
        />

        {/* Filters */}
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-wrap gap-4 items-center transition-colors duration-200"
        >
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Search Student
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, enrollment no, or email..."
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition"
            />
          </div>

          <div className="w-48">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Batch
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            >
              <option value="">All Batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" className="self-end">
            Search
          </Button>
        </form>

        <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden backdrop-blur-sm shadow-sm transition-colors duration-200">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton rows={5} />
            </div>
          ) : fetchError ? (
            <div className="p-6">
              <ErrorState
                title="Failed to Load Students"
                message={fetchError}
                onRetry={fetchStudents}
              />
            </div>
          ) : (
            <StudentsTable
              students={students}
              onEdit={(student) => setEditStudent(student)}
            />
          )}
        </div>
      </div>

      <EditStudentModal
        student={editStudent}
        batches={batches}
        isOpen={!!editStudent}
        onClose={() => setEditStudent(null)}
        onSave={handleSaveEdit}
        isSaving={isSaving}
      />
    </DashboardLayout>
  );
}
