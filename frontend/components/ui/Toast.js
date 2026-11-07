'use client';

import React, { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const bgStyles = {
    success: 'bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-900/90 dark:text-emerald-200 dark:border-emerald-700 shadow-md',
    error: 'bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-900/90 dark:text-rose-200 dark:border-rose-700 shadow-md',
    info: 'bg-indigo-50 text-indigo-900 border-indigo-300 dark:bg-indigo-900/90 dark:text-indigo-200 dark:border-indigo-700 shadow-md',
    warning: 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-900/90 dark:text-amber-200 dark:border-amber-700 shadow-md',
  };

  const style = bgStyles[type] || bgStyles.success;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-short">
      <div className={`px-4 py-3 rounded-lg border shadow-lg text-sm font-medium flex items-center gap-3 ${style}`}>
        <span>{message}</span>
        <button onClick={onClose} className="opacity-70 hover:opacity-100 transition p-1" aria-label="Close alert">
          ✕
        </button>
      </div>
    </div>
  );
}
