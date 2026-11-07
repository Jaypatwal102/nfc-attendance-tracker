'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ProtectedRoute from '../ProtectedRoute';
import ThemeToggle from '../ui/ThemeToggle';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout({ children, allowedRoles }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
        {/* Role-aware Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          {/* Header Bar */}
          <header className="h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 transition-colors duration-200">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-700 transition"
                aria-label="Open sidebar"
              >
                ☰
              </button>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 hidden sm:block">
                NFC Attendance System
              </h2>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-3 sm:gap-4">
              <ThemeToggle />

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

              {/* Profile Summary Badge */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="text-right hidden xs:block">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[140px] sm:max-w-[180px]">
                    {user?.student?.name || user?.teacher?.name || user?.email}
                  </p>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    {user?.role} ACCOUNT
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 text-xs shadow-sm">
                  {(user?.email?.[0] || 'U').toUpperCase()}
                </div>
              </div>
            </div>
          </header>

          {/* Page Body */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
