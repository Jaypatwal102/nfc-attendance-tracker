'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

/**
 * Modal to create a new batch.
 */
export default function AddBatchModal({ isOpen, onClose, onAddBatch, isSubmitting }) {
  const [name, setName] = useState('');
  const [program, setProgram] = useState('');
  const [admissionYear, setAdmissionYear] = useState(new Date().getFullYear());
  const [semester, setSemester] = useState(1);
  const [section, setSection] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAddBatch({
      name: name.trim().toUpperCase(),
      program,
      admission_year: parseInt(admissionYear),
      semester: parseInt(semester),
      section: section ? section.trim().toUpperCase() : null,
    });
    setName('');
    setProgram('');
    setSection('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Batch">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <Input
          label="Batch Identifier Name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. 2024_MCA"
          className="uppercase"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Program"
            type="text"
            required
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            placeholder="e.g. MCA, BTech"
          />

          <Input
            label="Admission Year"
            type="number"
            required
            value={admissionYear}
            onChange={(e) => setAdmissionYear(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Semester"
            type="number"
            required
            min="1"
            max="12"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          />

          <Input
            label="Section (Optional)"
            type="text"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            placeholder="e.g. A, B"
          />
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
            disabled={isSubmitting}
            loading={isSubmitting}
            className="flex-1"
          >
            Create Batch
          </Button>
        </div>
      </form>
    </Modal>
  );
}

