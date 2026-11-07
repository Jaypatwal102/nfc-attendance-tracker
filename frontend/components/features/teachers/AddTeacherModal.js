'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

/**
 * Modal to register a new teacher.
 */
export default function AddTeacherModal({ isOpen, onClose, onAddTeacher, isSubmitting }) {
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAddTeacher({ name, employee_id: employeeId, email, password });
    setName('');
    setEmployeeId('');
    setEmail('');
    setPassword('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register New Teacher Account">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <Input
          label="Full Name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Dr. Alan Turing"
        />

        <Input
          label="Employee ID"
          type="text"
          required
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          placeholder="e.g. EMP001"
        />

        <Input
          label="Email Address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="teacher@example.com"
        />

        <Input
          label="Initial Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
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
            disabled={isSubmitting}
            loading={isSubmitting}
            className="flex-1"
          >
            Create Teacher
          </Button>
        </div>
      </form>
    </Modal>
  );
}

