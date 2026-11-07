'use client';

import React from 'react';

/**
 * Reusable theme-aware Select component with label support.
 */
export default function Select({
  label,
  id,
  value,
  onChange,
  options = [],
  placeholder,
  required = false,
  disabled = false,
  error = '',
  className = '',
  children,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border ${
          error
            ? 'border-rose-400 focus:ring-rose-500'
            : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
        } text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 transition disabled:opacity-60 ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
        {children}
      </select>
      {error && <p className="text-[10px] text-rose-500 mt-1">{error}</p>}
    </div>
  );
}

