'use client';

import React from 'react';
import LoginForm from '@/components/features/auth/LoginForm';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function LoginPage() {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-12 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Theme Toggle in Top Right */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <LoginForm />
    </div>
  );
}
