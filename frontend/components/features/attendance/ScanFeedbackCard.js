'use client';

import React from 'react';

/**
 * Feedback card showing result of NFC tap (success, already marked, offline saved, or error).
 */
export default function ScanFeedbackCard({ feedback }) {
  if (!feedback) return null;

  const getStyle = () => {
    if (feedback.type === 'success') {
      return feedback.alreadyMarked
        ? 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/70 dark:border-amber-800/80 dark:text-amber-200'
        : 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/70 dark:border-emerald-800/80 dark:text-emerald-200';
    }
    if (feedback.type === 'offline') {
      return 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/70 dark:border-amber-800/80 dark:text-amber-200';
    }
    return 'bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950/70 dark:border-rose-800/80 dark:text-rose-200';
  };

  const getIcon = () => {
    if (feedback.type === 'success') {
      return feedback.alreadyMarked ? '⚠️' : '✅';
    }
    if (feedback.type === 'offline') {
      return '💾';
    }
    return '❌';
  };

  return (
    <div className={`p-5 rounded-xl border ${getStyle()} transition shadow-sm`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{getIcon()}</span>
        <div>
          <h4 className="text-sm font-bold">{feedback.message}</h4>
          {feedback.type === 'offline' && (
            <p className="text-xs mt-0.5 opacity-90">
              Tag: <strong>{feedback.nfcId}</strong> | Stored locally at {feedback.markedAt}.
              Will sync automatically when connection is restored.
            </p>
          )}
          {feedback.studentName && (
            <p className="text-xs mt-0.5 opacity-90">
              Student: <strong>{feedback.studentName}</strong> ({feedback.enrollmentNo}) | Marked at{' '}
              {feedback.markedAt}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

