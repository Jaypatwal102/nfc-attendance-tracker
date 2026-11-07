'use client';

import React from 'react';

/**
 * Reusable theme-aware Input component with label and helper text.
 */
export default function Input({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  disabled = false,
  error = '',
  className = '',
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border ${
          error
            ? 'border-rose-400 focus:ring-rose-500'
            : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
        } text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 transition disabled:opacity-60 ${className}`}
        {...props}
      />
      {error && <p className="text-[10px] text-rose-500 mt-1">{error}</p>}
    </div>
  );
}

