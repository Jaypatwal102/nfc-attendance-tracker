'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, role, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        if (role === 'ADMIN') router.push('/admin/dashboard');
        else if (role === 'TEACHER') router.push('/teacher/dashboard');
        else if (role === 'STUDENT') router.push('/student/dashboard');
        else router.push('/login');
      } else {
        router.push('/login');
      }
    }
  }, [loading, isAuthenticated, role, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Redirecting to portal...</p>
    </div>
  );
}
