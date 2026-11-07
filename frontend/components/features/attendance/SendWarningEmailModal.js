'use client';

import React from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal';

/**
 * Confirmation dialog before sending batch low attendance warning emails.
 */
export default function SendWarningEmailModal({
  isOpen,
  onClose,
  onConfirm,
  studentCount = 0,
  threshold = 75,
  isSending = false,
}) {
  const content = (
    <div className="space-y-4 text-xs">
      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
        Are you sure you want to send warning emails to <strong>{studentCount}</strong> students
        falling below the <strong>{threshold}%</strong> threshold?
      </p>
      <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
        Each student will receive a formatted low-attendance notification email, and the action will
        be recorded in the system email audit logs.
      </div>
    </div>
  );

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Confirm Dispatch Warning Emails"
      message={content}
      confirmText="Send Warning Emails"
      cancelText="Cancel"
      isLoading={isSending}
      variant="danger"
    />
  );
}

