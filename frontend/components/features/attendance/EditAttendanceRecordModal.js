'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

/**
 * Modal to adjust attendance status (PRESENT / ABSENT) and remarks.
 */
export default function EditAttendanceRecordModal({
  record,
  isOpen,
  onClose,
  onSave,
  isSaving,
}) {
  const [status, setStatus] = useState('PRESENT');
  const [remark, setRemark] = useState('');

  useEffect(() => {
    if (record) {
      setStatus(record.status || 'PRESENT');
      setRemark(record.remark || '');
    }
  }, [record]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!record) return;
    await onSave({
      id: record.id,
      status,
      remark,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Correction: ${record?.student?.name || ''}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Attendance Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
          >
            <option value="PRESENT">PRESENT</option>
            <option value="ABSENT">ABSENT</option>
          </select>
        </div>

        <Input
          label="Adjustment Remark"
          type="text"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder="e.g. Late arrival, Approved leave"
        />

        <div className="flex gap-3 pt-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            loading={isSaving}
            className="flex-1"
          >
            Save Correction
          </Button>
        </div>
      </form>
    </Modal>
  );
}

