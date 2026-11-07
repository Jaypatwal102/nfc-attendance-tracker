'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

/**
 * Modal to update student name, NFC ID tag, and batch allocation.
 */
export default function EditStudentModal({
  student,
  batches = [],
  isOpen,
  onClose,
  onSave,
  isSaving,
}) {
  const [name, setName] = useState('');
  const [nfcId, setNfcId] = useState('');
  const [batchId, setBatchId] = useState('');

  useEffect(() => {
    if (student) {
      setName(student.name || '');
      setNfcId(student.nfcId || '');
      setBatchId(student.batchId || '');
    }
  }, [student]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student) return;
    await onSave({
      id: student.id,
      name,
      nfc_id: nfcId.trim() || null,
      batch_id: batchId,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Student: ${student?.name || ''}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <Input
          label="Full Name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="NFC Tag ID"
          type="text"
          value={nfcId}
          onChange={(e) => setNfcId(e.target.value)}
          placeholder="e.g. NFC_TAG_MCA001"
        />

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Batch Assignment
          </label>
          <select
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.program})
              </option>
            ))}
          </select>
        </div>

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
            Save Profile
          </Button>
        </div>
      </form>
    </Modal>
  );
}

