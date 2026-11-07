'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

/**
 * Modal to switch a user's role (STUDENT, TEACHER, ADMIN).
 */
export default function ChangeRoleModal({ user, isOpen, onClose, onUpdateRole, isUpdating }) {
  const [selectedRole, setSelectedRole] = useState('STUDENT');

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role || 'STUDENT');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    await onUpdateRole(user.id, selectedRole);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Change Role: ${user?.email || ''}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Select User Role
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
          >
            <option value="STUDENT">STUDENT</option>
            <option value="TEACHER">TEACHER (Auto-creates Teacher Profile if needed)</option>
            <option value="ADMIN">ADMIN</option>
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
            disabled={isUpdating}
            loading={isUpdating}
            className="flex-1"
          >
            Save Role
          </Button>
        </div>
      </form>
    </Modal>
  );
}

