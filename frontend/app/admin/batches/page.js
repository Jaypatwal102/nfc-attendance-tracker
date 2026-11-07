'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import BatchesTable from '@/components/features/batches/BatchesTable';
import AddBatchModal from '@/components/features/batches/AddBatchModal';
import { adminApi, publicApi } from '@/services/api';
import { getErrorMessage } from '@/utils/errorHandler';

export default function AdminBatchesPage() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await publicApi.getBatches();
      setBatches(res.data?.data || []);
    } catch (err) {
      setFetchError(getErrorMessage(err, 'Unable to load batches directory. Please retry.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const handleAddBatch = async (data) => {
    setIsSubmitting(true);
    try {
      await adminApi.createBatch(data);
      setToast({ message: 'Batch registered successfully!', type: 'success' });
      setIsAddOpen(false);
      fetchBatches();
    } catch (err) {
      setToast({
        message: getErrorMessage(err, 'Failed to create batch. Please check inputs and retry.'),
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const headerActions = (
    <Button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2">
      <span>🏫</span>
      <span>Add New Batch</span>
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
          title="Batch Management"
          description="Configure academic program batches, admission years, semesters, and sections."
          actions={headerActions}
        />

        <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 overflow-hidden backdrop-blur-sm shadow-sm transition-colors duration-200">
          {loading ? (
            <div className="p-6">
              <LoadingSkeleton rows={4} />
            </div>
          ) : fetchError ? (
            <div className="p-6">
              <ErrorState
                title="Failed to Load Batches"
                message={fetchError}
                onRetry={fetchBatches}
              />
            </div>
          ) : (
            <BatchesTable batches={batches} />
          )}
        </div>
      </div>

      <AddBatchModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddBatch={handleAddBatch}
        isSubmitting={isSubmitting}
      />
    </DashboardLayout>
  );
}
