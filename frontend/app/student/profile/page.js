'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import { studentApi } from '../../../services/api';

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await studentApi.getProfile();
        setProfile(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  return (
    <DashboardLayout allowedRoles={['STUDENT']}>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Student Profile
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Personal information and active academic batch enrollment.
          </p>
        </div>

        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : (
          <div className="bg-slate-800/80 rounded-xl border border-slate-700/60 p-6 space-y-6 backdrop-blur-sm">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-700/60">
              <div className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 text-xl">
                {(profile?.name?.[0] || 'S').toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100">{profile?.name}</h3>
                <p className="text-xs font-mono text-indigo-400 mt-0.5">
                  Enrollment: {profile?.enrollment_no}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div>
                <span className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Email Address
                </span>
                <span className="text-slate-100 font-medium">{profile?.email}</span>
              </div>

              <div>
                <span className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Active Batch
                </span>
                <span className="text-slate-100 font-medium">
                  {profile?.batch?.name || 'Unassigned'}
                </span>
              </div>

              <div>
                <span className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Program
                </span>
                <span className="text-slate-100 font-medium">
                  {profile?.batch?.program || '—'}
                </span>
              </div>

              <div>
                <span className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Current Semester
                </span>
                <span className="text-slate-100 font-medium">
                  Semester {profile?.batch?.semester || '—'} ({profile?.batch?.section ? `Section ${profile.batch.section}` : 'General'})
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
