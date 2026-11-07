'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user, role, logout } = useAuth();

  // Role-aware navigation definitions
  const navConfigs = {
    STUDENT: [
      { name: 'Dashboard', href: '/student/dashboard', icon: '📊' },
      { name: 'Attendance History', href: '/student/attendance', icon: '📋' },
      { name: 'My Profile', href: '/student/profile', icon: '👤' },
    ],
    TEACHER: [
      { name: 'Dashboard', href: '/teacher/dashboard', icon: '📊' },
      { name: 'Take Attendance', href: '/teacher/attendance/take', icon: '📲' },
      { name: 'Attendance History', href: '/teacher/attendance', icon: '📋' },
      { name: 'Statistics', href: '/teacher/statistics', icon: '📈' },
      { name: 'Low Attendance', href: '/teacher/low-attendance', icon: '⚠️' },
    ],
    ADMIN: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
      { name: 'Manage Users', href: '/admin/users', icon: '👥' },
      { name: 'Teachers Directory', href: '/admin/teachers', icon: '👨‍🏫' },
      { name: 'Students Directory', href: '/admin/students', icon: '👨‍🎓' },
      { name: 'Subjects', href: '/admin/subjects', icon: '📚' },
      { name: 'Batches', href: '/admin/batches', icon: '🏫' },
      { name: 'Teacher Assignments', href: '/admin/teacher-assignments', icon: '🔗' },
      { name: 'Student Subjects', href: '/admin/student-subjects', icon: '📖' },
    ],
  };

  const navItems = navConfigs[role] || [];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-indigo-600/20">
                NFC
              </div>
              <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm tracking-tight">
                Attendance Tracker
              </span>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>

          {/* User Role Badge */}
          <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/60">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {role} PANEL
            </p>
            <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate mt-0.5">
              {user?.email}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-semibold shadow-xs dark:bg-indigo-600/15 dark:text-indigo-400 dark:border-indigo-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Action */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300 border border-rose-200 dark:border-rose-900/30 transition"
          >
            <span className="text-base">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
