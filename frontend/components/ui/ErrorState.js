'use client';

import React, { useState } from 'react';

/**
 * Reusable ErrorState component for failed API data loading.
 * Supports light and dark mode, user-friendly messaging, and an interactive retry button.
 */
export default function ErrorState({
  title = 'Unable to Load Data',
  message = 'Something went wrong while fetching the information. Your data is safe—please try again.',
  onRetry = null,
  retryText = 'Try Again',
  className = '',
}) {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry || retrying) return;
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-800/80 rounded-xl border border-rose-200/70 dark:border-rose-900/40 my-4 shadow-xs transition-colors duration-200 ${className}`}
      role="alert"
    >
      <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl mb-3 shadow-inner">
        ⚠️
      </div>
      <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100">
        {title}
      </h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1.5 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={handleRetry}
          disabled={retrying}
          className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold tracking-wider uppercase transition shadow-sm flex items-center gap-2"
        >
          {retrying ? (
            <>
              <svg
                className="animate-spin h-3.5 w-3.5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <span>Retrying...</span>
            </>
          ) : (
            <>
              <span>🔄</span>
              <span>{retryText}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

