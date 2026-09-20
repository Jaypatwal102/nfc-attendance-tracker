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
    success: 'bg-emerald-900/90 text-emerald-200 border-emerald-700',
    error: 'bg-rose-900/90 text-rose-200 border-rose-700',
    info: 'bg-indigo-900/90 text-indigo-200 border-indigo-700',
    warning: 'bg-amber-900/90 text-amber-200 border-amber-700',
  };

  const style = bgStyles[type] || bgStyles.success;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-short">
      <div className={`px-4 py-3 rounded-lg border shadow-lg text-sm font-medium flex items-center gap-3 ${style}`}>
        <span>{message}</span>
        <button onClick={onClose} className="opacity-70 hover:opacity-100 transition">
          ✕
        </button>
      </div>
    </div>
  );
}
