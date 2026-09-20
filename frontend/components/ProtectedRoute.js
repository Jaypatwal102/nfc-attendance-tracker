'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        // Redirect unauthorized user to their role home page
        if (role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else if (role === 'TEACHER') {
          router.push('/teacher/dashboard');
        } else if (role === 'STUDENT') {
          router.push('/student/dashboard');
        } else {
          router.push('/login');
        }
      }
    }
  }, [loading, isAuthenticated, role, allowedRoles, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm font-medium">Verifying authorization...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return null;
  }

  return children;
}
