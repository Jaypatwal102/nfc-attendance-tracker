'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

/**
 * Modal to create a new academic subject.
 */
export default function AddSubjectModal({ isOpen, onClose, onAddSubject, isSubmitting }) {
  const [courseCode, setCourseCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAddSubject({
      course_code: courseCode.trim().toUpperCase(),
      name,
      description,
    });
    setCourseCode('');
    setName('');
    setDescription('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Subject">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <Input
          label="Course Code"
          type="text"
          required
          value={courseCode}
          onChange={(e) => setCourseCode(e.target.value)}
          placeholder="e.g. MCA501"
          className="uppercase font-mono"
        />

        <Input
          label="Subject Name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Database Management System"
        />

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Course description..."
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
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
            Create Subject
          </Button>
        </div>
      </form>
    </Modal>
  );
}

