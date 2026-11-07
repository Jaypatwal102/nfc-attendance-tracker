'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

/**
 * Modular LoginForm component handling credentials, validation, session expiry notices,
 * and authentication state.
 */
export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('expired') === 'true') {
        setSessionExpiredNotice(true);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8 transition-colors duration-200">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-lg mx-auto mb-3 shadow-lg shadow-indigo-500/20">
          NFC
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          NFC Attendance Tracker
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Sign in to access your academic portal
        </p>
      </div>

      {/* Session Expired Notice */}
      {sessionExpiredNotice && !error && (
        <div className="mb-6 p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs font-medium flex items-center gap-2">
          <span>ℹ️</span>
          <span>Your session has expired. Please sign in again to continue.</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
        />

        <Input
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          loading={isSubmitting}
          className="w-full mt-2"
        >
          Sign In
        </Button>
      </form>

      {/* Credentials Tip */}
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/80 text-center">
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono leading-relaxed">
          Admin: admin@attendancetracker.com <br />
          Teacher: teacher@attendancetracker.com <br />
          Student: student@attendancetracker.com
        </p>
      </div>
    </div>
  );
}

