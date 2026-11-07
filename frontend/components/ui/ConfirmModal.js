'use client';

import React from 'react';
import Modal from './Modal';

/**
 * Standard confirmation dialog component for destructive or impactful actions.
 * Features theme-aware buttons, loading spinner, and customizable messaging.
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  variant = 'danger', // 'danger' | 'primary'
}) {
  const confirmButtonClass =
    variant === 'danger'
      ? 'bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white shadow-rose-600/20'
      : 'bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-indigo-600/20';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4 text-xs">
        {typeof message === 'string' ? (
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{message}</p>
        ) : (
          message
        )}

        <div className="flex gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 rounded-lg font-semibold transition shadow-sm flex items-center justify-center gap-2 ${confirmButtonClass}`}
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

