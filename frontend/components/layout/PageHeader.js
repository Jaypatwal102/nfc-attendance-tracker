'use client';

import React from 'react';

/**
 * Standardized PageHeader component across all portals.
 * Displays page title, descriptive subtitle, and optional right-aligned action buttons.
 */
export default function PageHeader({ title, description, actions = null, className = '' }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${className}`}>
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2.5 sm:gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}

