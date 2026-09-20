'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import StatCard from '../../../components/ui/StatCard';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import { adminApi, publicApi } from '../../../services/api';

export default function AdminDashboard() {
  const [counts, setCounts] = useState({
    users: 0,
    teachers: 0,
    students: 0,
    subjects: 0,
    batches: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSystemStats() {
      try {
        const [usersRes, teachRes, studRes, subRes, batchRes] = await Promise.all([
          adminApi.getUsers(),
          adminApi.getTeachers(),
          adminApi.getStudents(),
          publicApi.getSubjects(),
          publicApi.getBatches(),
        ]);

        setCounts({
          users: usersRes.data.data.length,
          teachers: teachRes.data.data.length,
          students: studRes.data.data.length,
          subjects: subRes.data.data.length,
          batches: batchRes.data.data.length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSystemStats();
  }, []);

  return (
    <DashboardLayout allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Administrator Control Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System overview, user role management, and academic configuration.
          </p>
        </div>

        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard title="Total Users" value={counts.users} color="indigo" />
              <StatCard title="Teachers" value={counts.teachers} color="sky" />
              <StatCard title="Students" value={counts.students} color="emerald" />
              <StatCard title="Subjects" value={counts.subjects} color="amber" />
              <StatCard title="Batches" value={counts.batches} color="rose" />
            </div>

            {/* Quick Management Shortcuts */}
            <div className="bg-slate-800/80 rounded-xl border border-slate-700/60 p-6 backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider mb-4 border-b border-slate-700/60 pb-3">
                Quick Administrative Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  href="/admin/users"
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-indigo-500/50 transition group"
                >
                  <span className="text-2xl block mb-2">👥</span>
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-indigo-400 transition">
                    Manage Users & Roles
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Promote users to Teacher/Admin and activate/deactivate accounts.
                  </p>
                </Link>

                <Link
                  href="/admin/teachers"
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-indigo-500/50 transition group"
                >
                  <span className="text-2xl block mb-2">👨‍🏫</span>
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-indigo-400 transition">
                    Add & View Teachers
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Register faculty members with Employee IDs and profiles.
                  </p>
                </Link>

                <Link
                  href="/admin/teacher-assignments"
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-indigo-500/50 transition group"
                >
                  <span className="text-2xl block mb-2">🔗</span>
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-indigo-400 transition">
                    Teacher Assignments
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Assign teachers to specific subjects and student batches.
                  </p>
                </Link>

                <Link
                  href="/admin/student-subjects"
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-indigo-500/50 transition group"
                >
                  <span className="text-2xl block mb-2">📖</span>
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-indigo-400 transition">
                    Student Subject Enrollments
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Map students to their active curriculum courses.
                  </p>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
